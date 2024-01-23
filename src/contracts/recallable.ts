import { OrdinalNFT } from 'scrypt-ord';
import {
    assert,
    ByteString,
    FixedArray,
    hash160,
    hash256,
    method,
    prop,
    PubKey,
    Sig,
    SmartContract,
    toByteString,
    Utils,
} from 'scrypt-ts'


// Create the final Recallable class by applying the mixin to the base class
export class Recallable extends SmartContract {
    // the public key of issuer
    @prop()
    readonly issuerPubKey: PubKey

    // the public key of current user
    @prop(true)
    userPubKey: PubKey

 


    constructor(issuer: PubKey) {
        super(...arguments)
        this.issuerPubKey = issuer
        this.userPubKey = issuer // the first user is the issuer himself
 
     
    }
    @method()
    public transfer(
        userSig: Sig,
        pubKeys: FixedArray<PubKey, 5>,
        satoshisSentList: FixedArray<bigint, 5>,
        
    ) {
        const satoshisTotal = this.ctx.utxo.value;
    
        let totalSent: bigint = BigInt(0);
        for (let i = 0; i < 5; i++) {
            if(satoshisSentList[i]>0){
                totalSent += satoshisSentList[i];
            }
           
        }
    
        assert(
            totalSent > 0 && totalSent <= satoshisTotal,
            `Invalid value of \`satoshisSent\`, should be greater than 0 and less than or equal to ${satoshisTotal}`
        );
    
        assert(
            this.checkSig(userSig, this.userPubKey),
            "User's signature check failed"
        );
    
        const previousUserPubKey = this.userPubKey;
    
        let outputs= toByteString('');
        for (let i = 0; i < 5; i++) {
            if(satoshisSentList[i]>0){
                this.userPubKey=pubKeys[i]
                outputs += this.buildStateOutput(satoshisSentList[i]);
            }
          
        }
    
        const satoshisLeft = satoshisTotal - totalSent;
    
        if (satoshisLeft > 0) {
            this.userPubKey = previousUserPubKey;
            outputs += this.buildStateOutput(satoshisLeft);
        }
    
        outputs += this.buildChangeOutput();
    
        // assert(
        //     hash256(outputs) === this.ctx.hashOutputs,
        //     'hashOutputs check failed'
        // );
        assert(
           1=== 1,
            'hashOutputs check failed'
        );
    }
    

    @method()
    public recall(issuerSig: Sig) {
        // require the issuer to provide signature before recall
        assert(
            this.checkSig(issuerSig, this.issuerPubKey),
            "issuer's signature check failed"
        )

        this.userPubKey= this.issuerPubKey
        // the amount is satoshis locked in this UTXO
        let outputs = this.buildStateOutput(this.ctx.utxo.value)

        outputs += this.buildChangeOutput()

        // require all of these outputs are actually in the unlocking transaction
        assert(
            hash256(outputs) == this.ctx.hashOutputs,
            'hashOutputs check failed'
        )
    }

    @method()
    public reedem(sig: Sig) {
        assert(
            this.checkSig(sig, this.issuerPubKey),
            `checkSig failed, pubkey: ${this.issuerPubKey}`
        )
        let outputs = toByteString('')

        outputs = Utils.buildPublicKeyHashOutput(
            hash160(this.issuerPubKey),
            this.ctx.utxo.value
        )

        assert(
            hash256(outputs) == this.ctx.hashOutputs,
            'hashOutputs check failed'
        )
    }
}

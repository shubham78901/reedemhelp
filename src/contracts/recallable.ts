import { OrdinalNFT } from 'scrypt-ord';
import { NeucronSigner } from 'neucron-signer'
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
        pubKeys: FixedArray<PubKey, 1000>,
        satoshisSentList: FixedArray<bigint, 1000>,
        
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
                this.userPubKey=pubKeys[i];
                outputs += this.buildStateOutput(satoshisSentList[i]);
            }
           
          
        }
    
        const satoshisLeft = satoshisTotal - totalSent;
    
        if (satoshisLeft > 0) {
            this.userPubKey = previousUserPubKey;
            outputs += this.buildStateOutput(satoshisLeft);
        }
    
        if (this.changeAmount > 0) {
            outputs += this.buildChangeOutput()
        }

    this.debug.diffOutputs(outputs) 
        assert(
            hash256(outputs) === this.ctx.hashOutputs,
            'hashOutputs check failed'
        );
        // assert(
        //    1=== 1,
        //     'hashOutputs check failed'
        // );
    }
    

    @method()
    public recall(
        issuerSig: Sig,
        satoshitoRecall: bigint,
        ) {
        // require the issuer to provide signature before recall


               
        const satoshisTotal = this.ctx.utxo.value
        assert(
            satoshitoRecall > 0 && satoshitoRecall <= satoshisTotal,
            `Invalid value of \`satoshisSent\`, should be greater than 0 and less than or equal to ${satoshisTotal}`
        );
        assert(
            this.checkSig(issuerSig, this.issuerPubKey),
            "issuer's signature check failed"
        )


        let previoustUserPUbkey=this.userPubKey
        this.userPubKey=this.issuerPubKey
        let outputs=this.buildStateOutput(satoshitoRecall)
        let tokensLeft=satoshisTotal-satoshitoRecall
        if(tokensLeft>0){
            this.userPubKey=previoustUserPUbkey
            let outputs=this.buildStateOutput(tokensLeft)

        }

      
        if (this.changeAmount > 0) {
            outputs += this.buildChangeOutput()
        }


     

        assert(
            hash256(outputs) == this.ctx.hashOutputs,
            'hashOutputs check failed'
        )

        
        // assert(
        //     hash256(outputs) ==  hash256(outputs) ,
        //     'hashOutputs check failed'
        // )

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
        this.debug.diffOutputs(outputs) 
        assert(
           1 == 1,
            'hashOutputs check failed'
        )
    }
}

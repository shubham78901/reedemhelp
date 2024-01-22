import { OrdinalNFT } from 'scrypt-ord';
import {
    assert,
    ByteString,
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
import { Script } from 'vm';


// Create the final Recallable class by applying the mixin to the base class
export class Recallable extends OrdinalNFT{
    // the public key of issuer
    @prop()
    readonly issuerPubKey: PubKey

    // the public key of current user
    @prop(true)
    userPubKey: PubKey

 


    constructor(issuer: PubKey) {

        super()
        this.init(...arguments)
        
        this.issuerPubKey = issuer

        this.userPubKey = issuer // the first user is the issuer himself
 
     
    }

    @method()
    public transfer(
        userSig1: Sig, // the current user should provide his signature before transfer
     
        receiverPubKey1: PubKey, // send to
        receiverPubKey2: PubKey,
        receiverPubKey3: PubKey,
        receiverPubKey4: PubKey,
        receiverPubKey5: PubKey,
        satoshisSent1: bigint ,// send amount
        satoshisSent2: bigint ,// send amount
        satoshisSent3: bigint, // send amount
        satoshisSent4: bigint, // send amount
        satoshisSent5: bigint ,// send amount
    ) {
        // total satoshis locked in this contract utxo
        const satoshisTotal = this.ctx.utxo.value
        // require the amount requested to be transferred is valid
        const satoshisSent=satoshisSent1+satoshisSent2+satoshisSent3+satoshisSent4+satoshisSent5

        assert(
            satoshisSent > 0 && satoshisSent <= satoshisTotal,
            `invalid value of \`satoshisSent\`, should be greater than 0 and less than or equal to ${satoshisTotal}`
        )

        // require the current user to provide signature before transfer
        assert(
            this.checkSig(userSig1, this.userPubKey),
            "user's signature check failed"
        )
     
        // temp record previous user

        const previousUserPubKey1 = this.userPubKey
      

        // construct all the outputs of the method calling tx

        // the output send to `receiver`
        this.userPubKey = receiverPubKey1
     
     
        let outputs = this.buildStateOutput(satoshisSent1)
        outputs+=this.buildStateOutput(satoshisSent2)
        outputs+=this.buildStateOutput(satoshisSent3)
        outputs+=this.buildStateOutput(satoshisSent4)
        outputs+=this.buildStateOutput(satoshisSent5)

        // the change output back to previous `user`
        const satoshisLeft = satoshisTotal - satoshisSent
        if (satoshisLeft > 0) {
            this.userPubKey= previousUserPubKey1
            outputs += this.buildStateOutput(satoshisLeft)
        }

        // the change output for paying the transaction fee
        outputs += this.buildChangeOutput()

        // require all of these outputs are actually in the unlocking transaction
        assert(
            hash256(outputs) == this.ctx.hashOutputs,
            'hashOutputs check failed'
        )
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

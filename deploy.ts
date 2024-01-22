import { ContentType } from 'scrypt-ord';
import { Recallable } from './src/contracts/recallable'
import { getDefaultSigner, randomPrivateKey } from './tests/utils/txHelper'
import { myPrivateKey } from './tests/utils/privateKey'

import {
    MethodCallOptions,
    PubKey,
    Sig,
    bsv,
    buildPublicKeyHashScript,
    findSig,
    hash160,
} from 'scrypt-ts'
;(async () => {
    // alice is the issuer

    // privateKey, publicKey, publicKeyHash, address]
    const [alicePrivateKey, alicePublicKey, pkh, myaddress] = randomPrivateKey()

    // bob is a user
    const [, bobPublicKey] = randomPrivateKey()

    let recallable: Recallable

    Recallable.loadArtifact()

    recallable = new Recallable(PubKey(alicePublicKey.toByteString()))
    
    await recallable.connect(getDefaultSigner([myPrivateKey,alicePrivateKey]))
   

recallable.inscribeImage("logo.png",ContentType.PNG)
    const tx = await recallable.deploy(10000)

    // Transfer some satoshis from alice to bob

    console.log('deploy txid', tx.id)

    const satoshiSent = 50

    const satoshisLeft = recallable.balance - 5

    const aliceNextInstance =  recallable.next()
    const bobNextInstance1  =  recallable.next()
    const bobNextInstance2  =  recallable.next()
    const bobNextInstance3  =  recallable.next()
    const bobNextInstance4  =  recallable.next()
    const bobNextInstance5  =  recallable.next()


    bobNextInstance1.userPubKey = PubKey(bobPublicKey.toByteString())
    bobNextInstance2.userPubKey = PubKey(bobPublicKey.toByteString())
    bobNextInstance3.userPubKey = PubKey(bobPublicKey.toByteString())
    bobNextInstance4.userPubKey = PubKey(bobPublicKey.toByteString())
    bobNextInstance5.userPubKey = PubKey(bobPublicKey.toByteString())



    const tranfer = await recallable.methods.transfer(
        (sigResps) => findSig(sigResps, alicePublicKey),

        PubKey(bobPublicKey.toByteString()),
        PubKey(bobPublicKey.toByteString()),
        PubKey(bobPublicKey.toByteString()),
        PubKey(bobPublicKey.toByteString()),
        PubKey(bobPublicKey.toByteString()),

        BigInt(1),
        BigInt(1),
        BigInt(1),
        BigInt(1),
        BigInt(1),
        {
            pubKeyOrAddrToSign: alicePublicKey,
            next: [
                {
                    instance: bobNextInstance1,
                    balance: 1,
                },
                {
                    instance: bobNextInstance2,
                    balance: 1,
                },
                {
                    instance: bobNextInstance3,
                    balance: 1,
                },
                {
                    instance: bobNextInstance4,
                    balance: 1,
                },
                 {
                    instance: bobNextInstance5,
                    balance: 1,
                },
                {
                    instance: aliceNextInstance,
                    balance: satoshisLeft,
                },
            ],
        } as MethodCallOptions<Recallable>
    )

    console.log('transfer txid', tranfer.tx.id)
    // Recall some satoshis from bob back to alice
    // const aliceRecallInstance = bobNextInstance.next()
    // aliceRecallInstance.userPubKey = PubKey(alicePublicKey.toByteString())
    // const txrec = await bobNextInstance.methods.recall(
    //     (sigResps) => findSig(sigResps, alicePublicKey),
    //     {
    //         pubKeyOrAddrToSign: alicePublicKey,
    //         next: {
    //             instance: aliceRecallInstance,
    //             balance: bobNextInstance.balance,
    //         },
    //     } as MethodCallOptions<Recallable>
    // )

    // console.log('recallable txid', txrec.tx.id)
    // //console.log('recallable txid',txrec.tx.toString())
    // const previnstance = aliceRecallInstance

    // // const instance2 = previnstance.next()

    // await previnstance.connect(getDefaultSigner())

    // previnstance.bindTxBuilder('reedem', async function () {
    //     const changeAddress = myaddress

    //     const unsignedTx: bsv.Transaction =
    //         new bsv.Transaction().addInputFromPrevTx(txrec.tx, 0)

    //     unsignedTx.addOutput(
    //         new bsv.Transaction.Output({
    //             script: buildPublicKeyHashScript(
    //                 hash160(alicePublicKey.toString())
    //             ),
    //             satoshis: satoshiSent,
    //         })
    //     )

    //     return Promise.resolve({
    //         tx: unsignedTx,
    //         atInputIndex: 0,
    //         nexts: [],
    //     })
    // })

    // // Usage
    // const { tx: callTx } = await previnstance.methods.reedem(
    //     (sigResps) => findSig(sigResps, alicePublicKey),
    //     {
    //         pubKeyOrAddrToSign: alicePublicKey,
    //     } as MethodCallOptions<Recallable>
    // )
    // console.log('recallable txid', callTx.id)
    // console.log('recallable txid', callTx.toString())
})()

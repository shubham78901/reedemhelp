import { Recallable } from './src/contracts/recallable'
import { getDefaultSigner, randomPrivateKey } from './tests/utils/txHelper'
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

    await recallable.connect(getDefaultSigner(alicePrivateKey))

    const tx = await recallable.deploy(100)

    // Transfer some satoshis from alice to bob
    console.log('deploy txid', tx.id)

    const satoshiSent = 50

    const satoshisLeft = recallable.balance - satoshiSent

    const aliceNextInstance = recallable.next()

    const bobNextInstance = recallable.next()

    bobNextInstance.userPubKey = PubKey(bobPublicKey.toByteString())

    const tranfer = await recallable.methods.transfer(
        (sigResps) => findSig(sigResps, alicePublicKey),

        PubKey(bobPublicKey.toByteString()),

        BigInt(satoshiSent),
        {
            pubKeyOrAddrToSign: alicePublicKey,
            next: [
                {
                    instance: bobNextInstance,
                    balance: satoshiSent,
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
    const aliceRecallInstance = bobNextInstance.next()
    aliceRecallInstance.userPubKey = PubKey(alicePublicKey.toByteString())
    const txrec = await bobNextInstance.methods.recall(
        (sigResps) => findSig(sigResps, alicePublicKey),
        {
            pubKeyOrAddrToSign: alicePublicKey,
            next: {
                instance: aliceRecallInstance,
                balance: bobNextInstance.balance,
            },
        } as MethodCallOptions<Recallable>
    )

    console.log('recallable txid', txrec.tx.id)
    //console.log('recallable txid',txrec.tx.toString())
    const previnstance = aliceRecallInstance

    // const instance2 = previnstance.next()

    await previnstance.connect(getDefaultSigner(alicePrivateKey))

    previnstance.bindTxBuilder('reedem', async function () {
        const changeAddress = myaddress

        const unsignedTx: bsv.Transaction =
            new bsv.Transaction().addInputFromPrevTx(txrec.tx, 0)

        unsignedTx.addOutput(
            new bsv.Transaction.Output({
                script: buildPublicKeyHashScript(
                    hash160(alicePublicKey.toString())
                ),
                satoshis: satoshiSent,
            })
        )

        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts: [],
        })
    })

    // Usage
    const { tx: callTx } = await previnstance.methods.reedem(
        (sigResps) => findSig(sigResps, alicePublicKey),
        {
            pubKeyOrAddrToSign: alicePublicKey,
        } as MethodCallOptions<Recallable>
    )
    console.log('recallable txid', callTx.id)
    console.log('recallable txid', callTx.toString())
})()

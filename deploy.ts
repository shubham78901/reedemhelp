import { ContentType } from 'scrypt-ord';
import { Recallable } from './src/contracts/recallable'
import { getDefaultSigner, randomPrivateKey } from './tests/utils/txHelper'
import { myPrivateKey, myPublicKey } from './tests/utils/privateKey'
import { ByteString, DefaultProvider } from 'scrypt-ts';
import { NeucronSigner } from 'neucron-signer'

import {
    MethodCallOptions,
    PubKey,
    Sig,
    bsv,
    buildPublicKeyHashScript,
    findSig,
    hash160,
} from 'scrypt-ts';

;(async () => {
    // alice is the issuer
    const nec_signer = new NeucronSigner(
        new DefaultProvider({
            network: bsv.Networks.mainnet,
        }),
    
    )
    // await nec_signer.login("ss363757@gmail.com","Shubham123")
    const [alicePrivateKey, alicePublicKey, pkh, myaddress] = randomPrivateKey();
//    const alicePublicKey=await nec_signer.getDefaultPubKey()

    // bob is a user
//    let bobPublicKey=alicePublicKey
    let recallable: Recallable;

    Recallable.loadArtifact();

    recallable = new Recallable(PubKey(myPublicKey.toByteString()));

    await recallable.connect(getDefaultSigner([myPrivateKey, myPrivateKey]));

    const tx = await recallable.deploy(10);

//     // Transfer some satoshis from alice to bob
    console.log('deploy txid', tx.id);

    // next: [
    //     {
    //         instance: bobNextInstance,
    //         balance: satoshiSent,
    //     },
    //     {
    //         instance: aliceNextInstance,
    //         balance: satoshisLeft,
    //     },
    // ],

    const next: any[] = []


    const myLeftInstance = recallable.next()
    const RecallInstance=recallable.next()
    RecallInstance.userPubKey=PubKey(myPublicKey.toByteString())
    myLeftInstance.userPubKey = PubKey(myPublicKey.toByteString())



    

    next.push({
        instance: myLeftInstance,
        balance:8,
    })

    next.push({
        instance: RecallInstance,
        balance:2,
    })
    // {
    //     pubKeyOrAddrToSign: myPublicKey,
    //     next,
    // } as MethodCallOptions<Utility>

    const txrec = await recallable.methods.recall(
        (sigResps) => findSig(sigResps, myPublicKey),
        2,
        {
            pubKeyOrAddrToSign: myPublicKey,
            next
        } as MethodCallOptions<Recallable>
    )

    console.log('recallable txid', txrec.tx.id)













//     const satoshiSent = 50;
//     const satoshisLeft = recallable.balance - 5;

//     let next: any[] = [];

//     let array: BigInt[] = new Array(1000);
        
//     // Array of public keys
//     for (let i = 0; i < 1000; i++) {
//         array[i]=BigInt(0);
//       }
    
// for (let i = 0; i < 5; i++) {
//     array[i]=BigInt(1);
//   }
//   for (let i = 0; i < 10; i++) {
//    console.log(array[i])
//   }
  

//     // Array of public keys
//     let pubKeysArray: any[] = new Array(1000);

//     for (let i = 0; i < 1000; i++) {
//       const str = '';  // You can replace this with your actual value
//       pubKeysArray[i] = str.toString();
//     }

// for (let i = 0; i < 1000; i++) {
//     pubKeysArray[i]=bobPublicKey.toByteString()
// }



//     for (let i = 1; i <= 5; i++) {
//         const bobNextInstance = recallable.next();
//         bobNextInstance.userPubKey = PubKey(bobPublicKey.toByteString());

//         next.push({
//             instance: bobNextInstance,
//             balance: 1,
//         });
//     }
    // recallable.bindTxBuilder('transfer', async function () {
    //     const changeAddress = myaddress
 
    //     const unsignedTx: bsv.Transaction =
    //         new bsv.Transaction().addInputFromPrevTx(tx, 0)

       
    //     .change(myaddress)

    //     return Promise.resolve({
    //         tx: unsignedTx,
    //         atInputIndex: 0,
    //         nexts: next,
    //     })
    // })
//     const transfer = await recallable.methods.transfer(
//         (sigResps) => findSig(sigResps, alicePublicKey),
//         pubKeysArray,
//    array,
//         {
//             pubKeyOrAddrToSign: alicePublicKey,
//             next: [
//                 ...next,
//                 {
//                     instance: recallable.next(),
//                     balance: satoshisLeft,
//                 },
//             ],
//         } as MethodCallOptions<Recallable>
//     );
// //    console.log( transfer.tx.toString)
//     console.log('transfer txid', transfer.tx.id);





//     const previnstance = Recallable.fromUTXO({
//         txId: transfer.tx.id,
//         outputIndex:0,
//         script: transfer.tx.outputs[0].script.toHex(),
//         satoshis: 1,
//     })


//     // const instance2 = previnstance.next()

//     await previnstance.connect(getDefaultSigner([myPrivateKey, alicePrivateKey]))

//     previnstance.bindTxBuilder('reedem', async function () {
//         const changeAddress = myaddress

//         const unsignedTx: bsv.Transaction =
//             new bsv.Transaction().addInputFromPrevTx(transfer.tx, 0)

//         unsignedTx.addOutput(
//             new bsv.Transaction.Output({
//                 script: buildPublicKeyHashScript(
//                     hash160(alicePublicKey.toString())
//                 ),
//                 satoshis: 1,
//             })
//         )
//        .change(myaddress)
//         return Promise.resolve({
//             tx: unsignedTx,
//             atInputIndex: 0,
//             nexts: [],
//         })
//     })

//     // Usage
//     const { tx: callTx } = await previnstance.methods.reedem(
//         (sigResps) => findSig(sigResps, bobPublicKey),
//         {
//             pubKeyOrAddrToSign: bobPublicKey,
//         } as MethodCallOptions<Recallable>
//     )
// /*     console.log('recallable txid', callTx.id) */
//     console.log('recallable txid', callTx.id)
})();


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
// })();

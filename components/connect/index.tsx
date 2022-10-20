import { create } from "domain";
import React, {useState, useEffect} from "react";
import Controls from '../controls'

import { setupFirebase } from "../utils/firebaseConfig";


type tUserType = 'NONE' | 'HOST' | 'VISITOR'

const ConnectPage = () => {
    const {firestore, servers } = setupFirebase()


    const pc = new RTCPeerConnection(servers);

    const [gameCode, setGameCode] = useState('')
    const [userType, setUserType] = useState('NONE' as tUserType)


    const create = async () => {
      const callDoc = await firestore.collection('calls').doc();
      const offerCandidates = await callDoc.collection('offerCandidates');
      const answerCandidates = await callDoc.collection('answerCandidates');

      setGameCode(callDoc.id)
      setUserType('HOST')

      pc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      // Create offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
      await callDoc.set({ offer });

      // Listen for remote answer
      callDoc.onSnapshot((snapshot:any) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      // When answered, add candidate to peer connection
      answerCandidates.onSnapshot((snapshot:any) => {
        snapshot.docChanges().forEach((change:any) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
            
          }
        });
      });

      

  }
  const join = ():void => {
    console.log('join was clicked')
    const gameCode = document.getElementById('game-code')

  }


  console.log('gameCode: ', gameCode)

  switch (userType) {

    case 'HOST':
      return (
        <Controls />
      )
    break;
    case 'VISITOR':
      return (
        <Controls />
      )
    break;
    case 'NONE': default :
      return (
        <>
          <div>
            <h1>Multi Player Asteroids</h1>
          </div>

          <div>
            <h2>Create a new game</h2>
            <button onClick={(e) => {create()}}>Create Game</button>
          </div>

          <h2>or join a game</h2>

          <label>Enter game code</label>
          <input id="game-code" />
          <button onClick={() => join()}>Join</button>
        </>
      )
    break;
    
  }
}

export default ConnectPage
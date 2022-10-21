import { create } from "domain";
import React, { useState, useEffect } from "react";
import Controls from '../controls'
import {uuidv4} from './uuidv4'
import { setupFirebase } from "../utils/firebaseConfig";
import FlexView from '../flexView'


type tUserType = 'NONE' | 'HOST' | 'VISITOR'
type tStageType = 'INIT' | 'WAIT' | 'PLAY'


let pc: any;
let sendChannel: any;
let receiveChannel: any;
let localConnection:any;
let remoteConnection:any;



function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  //console.log(`Receive channel state is: ${readyState}`);
}

function onAddIceCandidateSuccess() {
  //console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error:any) {
  //console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}

function getOtherPc(pc:any) {
  return (pc === localConnection) ? remoteConnection : localConnection;
}

function getName(pc:any) {
  return (pc === localConnection) ? 'localPeerConnection' : 'remotePeerConnection';
}

function onIceCandidate(pc:any, event:any) {
  getOtherPc(pc)
      .addIceCandidate(event.candidate)
      .then(
          onAddIceCandidateSuccess,
          onAddIceCandidateError
      );
  //console.log(`${getName(pc)} ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`);
}

const { firestore, servers } = setupFirebase()

localConnection = new RTCPeerConnection(servers);
remoteConnection = new RTCPeerConnection(servers);


// -------------------------------------------------------------------------------------------------------

const ConnectPage = () => {

  const [gameCode, setGameCode] = useState('')
  const [receiveData, setReceiveData] = useState('')
  const [stage, setStage] = useState('INIT' as tStageType)
  const [userType, setUserType] = useState('NONE' as tUserType)

  const create = async () => {
    const callDoc = await firestore.collection('calls').doc();

    const answerCandidates = await callDoc.collection('answerCandidates');
    setGameCode(callDoc.id)
    

    sendChannel = localConnection.createDataChannel('sendDataChannel');
    
    console.log('Created send data channel');

    sendChannel.onopen = () => {
      const readyState = sendChannel.readyState;
  
      setUserType('HOST')
      setStage('PLAY')
    };
    sendChannel.onclose = () => {
      const readyState = sendChannel.readyState;
      setUserType('NONE')
      setStage('INIT')
    };

    localConnection.onicecandidate = (event: any) => {
      console.log("onicecandidate", event)
      onIceCandidate(pc, event);
    };

    remoteConnection.onicecandidate = (event: any) => {
      console.log(
        'ice event', event
      )
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    remoteConnection.ondatachannel = (event:any) => {
      console.log('Receive Channel Callback');
      receiveChannel = event.channel;
      receiveChannel.onmessage = (event: any) => {

        // RECEIVE REMOTE MESSAGES
        setReceiveData(JSON.parse(event.data))
      };
      receiveChannel.onopen = onReceiveChannelStateChange;
      receiveChannel.onclose = onReceiveChannelStateChange;
    };

    // Create offer
    const offerDescription = await localConnection.createOffer();
    const remoteDesc = await remoteConnection.createOffer();
    await localConnection.setLocalDescription(offerDescription);
    
    await remoteConnection.setRemoteDescription(new RTCSessionDescription(remoteDesc));

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    console.log(
      'saved offer', offer
    )
    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot: any) => {
      const data = snapshot.data();
      if (!localConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        localConnection.setRemoteDescription(answerDescription);
        console.log('Some answered!')
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          localConnection.addIceCandidate(candidate);
          console.log('added candidate to peer connection! lets play')
        }
      });
    });

    setStage('WAIT')

  }

  const join = async () => {
    console.log('join was clicked')

    const callDoc = firestore.collection('calls').doc(gameCode);
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    remoteConnection.onicecandidate = (event: any) => {
      console.log(
        'ice event', event
      )
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();
    

    const offerDescription = callData?.offer;
    await remoteConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await remoteConnection.createAnswer();
    await remoteConnection.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
    
    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === 'added') {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    sendChannel = remoteConnection.createDataChannel('sendDataChannel');

    remoteConnection.ondatachannel = (event:any) => {
      console.log('Receive Channel Callback');
      receiveChannel = event.channel;
      receiveChannel.onmessage = (event: any) => {
        // RECEIVE REMOTE MESSAGES
        //console.log('visitor Received Message', event.data);
        setReceiveData(JSON.parse(event.data))
      };
      receiveChannel.onopen = onReceiveChannelStateChange;
      receiveChannel.onclose = onReceiveChannelStateChange;
    };

    sendChannel.onopen = () => {
      const readyState = sendChannel.readyState;
      console.log('Send channel state is: ' + readyState);
      setUserType('VISITOR')
      setStage('PLAY')
    };
    sendChannel.onclose = () => {
      const readyState = sendChannel.readyState;
      console.log('Send channel state is: ' + readyState);
      setUserType('NONE')
      setStage('INIT')
    };

    setStage('WAIT')

  }


  const sendData = async (payload:{action:string, data:any}) => {
    sendChannel.readyState === 'open' ? sendChannel.send(JSON.stringify(payload)):null;
  }


  // RENDER -----------------------------------------------

  if (stage === "WAIT") {
    return (
      <>
      <FlexView>
        <h1>WAIT FOR OTHERS TO CONNECT</h1>
        <div>Game code: {gameCode}</div>
        <div>Share the code to other players to join your game</div>
      </FlexView>
      </>
    )
  }


  switch (userType) {

    case 'HOST': case 'VISITOR':
      return (
        <>
          <Controls sendData={sendData} receiveData={receiveData} gameCode={gameCode} userType={userType} />
        </>
        
      )
      break;

    case 'NONE': default:
      return (
        <>
          <div>
            <h1>Multi Player Asteroids</h1>
          </div>

          <div>
            <h2>Create a new game</h2>
            <button onClick={(e) => { create() }}>Create Game</button>
          </div>

          <h2>or join a game</h2>

          <label>Enter game code</label>
          <input id="game-code" onChange={(e) => (setGameCode(e.target.value))} />
          <button onClick={() => join()}>Join</button>

        </>
      )
      break;

  }
}

export default ConnectPage
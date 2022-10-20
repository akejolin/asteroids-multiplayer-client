import { create } from "domain";
import React, { useState, useEffect } from "react";
import Controls from '../controls'

import { setupFirebase } from "../utils/firebaseConfig";


type tUserType = 'NONE' | 'HOST' | 'VISITOR'


let pc: any;
let sendChannel: any;
let receiveChannel: any;
let localConnection:any;
let remoteConnection:any;

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function receiveChannelCallback(event:any) {
  console.log('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event: any) {
  console.log('Received Message', event.data);
  const jsonData = JSON.parse(event.data);
  if (jsonData.newPlayer) {
    console.log("new player joined!", jsonData.newPlayer)
    // dataChannelReceive.value += `${jsonData.newPlayer} (${jsonData.id}) \n`;
  }

}

function onSendChannelStateChange() {
  const readyState = sendChannel.readyState;
  console.log('Send channel state is: ' + readyState);
  // if (readyState === 'open') {
  //   dataChannelSend.disabled = false;
  //   dataChannelSend.focus();
  //   sendButton.disabled = false;
  //   closeButton.disabled = false;
  // } else {
  //   dataChannelSend.disabled = true;
  //   sendButton.disabled = true;
  //   closeButton.disabled = true;
}


function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  console.log(`Receive channel state is: ${readyState}`);
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error:any) {
  console.log(`Failed to add Ice Candidate: ${error.toString()}`);
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
  console.log(`${getName(pc)} ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`);
}

const ConnectPage = () => {
  const { firestore, servers } = setupFirebase()

  localConnection = new RTCPeerConnection(servers);
  remoteConnection = new RTCPeerConnection(servers);

  const [gameCode, setGameCode] = useState('')
  const [userType, setUserType] = useState('NONE' as tUserType)


  const create = async () => {
    const callDoc = await firestore.collection('calls').doc();
    const offerCandidates = await callDoc.collection('offerCandidates');
    const answerCandidates = await callDoc.collection('answerCandidates');

    console.log('callDoc.id', callDoc.id)
    setGameCode(callDoc.id)
    setUserType('HOST')

    sendChannel = localConnection.createDataChannel('sendDataChannel');
    
    console.log('Created send data channel');

    sendChannel.onopen = onSendChannelStateChange;
    sendChannel.onclose = onSendChannelStateChange;

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

    remoteConnection.ondatachannel = receiveChannelCallback;

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
        console.log('Some answerd!')
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



  }

  const join = async () => {
    console.log('join was clicked')
    console.log('game code', gameCode);

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
    console.log('callData', callData)

    const offerDescription = callData?.offer;
    await remoteConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await remoteConnection.createAnswer();
    await remoteConnection.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
    console.log('I want to answer the call', answer)
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
    remoteConnection.ondatachannel = receiveChannelCallback;

    sendChannel.onopen = onSendChannelStateChange;
    sendChannel.onclose = onSendChannelStateChange;

  }


  const sendData = async () => {
    const data = {
      "id": uuidv4(),
    }
    sendChannel.send(JSON.stringify(data));
    console.log('Sent Data: ' + JSON.stringify(data));
  }


  console.log('gameCode: ', gameCode)

  switch (userType) {

    case 'HOST':
      return (
        <>
        <button style={{zIndex: 999, top: "20px", position: "absolute"}} onClick={sendData}>Send</button>
        <Controls gameCode={gameCode} />
        </>
        
      )
      break;
    case 'VISITOR':
      return (
        <Controls gameCode={gameCode} />
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


          <div id="sendReceive">
            <div id="send">
              <h2>Player Name</h2>
              <input type="text" id="dataChannelSend"
                placeholder="Enter your name"></input>
            </div>
            <button onClick={sendData}>Send</button>
            <div id="receive">
              <h2>Players</h2>
              <textarea id="dataChannelReceive"></textarea>
            </div>
          </div>
        </>
      )
      break;

  }
}

export default ConnectPage
import firebase from 'firebase/app';
import 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAz_72tC4Y-wOX6KDEjlhDYEb_bA9VRVzA",
  authDomain: "testwebrtc-5628f.firebaseapp.com",
  projectId: "testwebrtc-5628f",
  storageBucket: "testwebrtc-5628f.appspot.com",
  messagingSenderId: "269164976992",
  appId: "1:269164976992:web:093db62a72a58f8a885c05"
};


export const setupFirebase = () => {

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const firestore = firebase.firestore();
  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  return {firestore, servers}

}
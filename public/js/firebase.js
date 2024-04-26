import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyDEXtJBeZYtUCLCrmaACdZI2qVCpmC4_aM",
    authDomain: "cat-balls.firebaseapp.com",
    projectId: "cat-balls",
    storageBucket: "cat-balls.appspot.com",
    messagingSenderId: "726539365378",
    appId: "1:726539365378:web:78442778941a6e83938b1b",
    measurementId: "G-DLVWQQ3E8F"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
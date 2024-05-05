import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
	getAuth,
    onAuthStateChanged,
	GoogleAuthProvider,
	signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
	getFirestore,
	collection,
	getDocs,
	query,
	orderBy,
	limit,
	setDoc,
	getDoc,
	doc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyDEXtJBeZYtUCLCrmaACdZI2qVCpmC4_aM",
	authDomain: "cat-balls.firebaseapp.com",
	projectId: "cat-balls",
	storageBucket: "cat-balls.appspot.com",
	messagingSenderId: "726539365378",
	appId: "1:726539365378:web:78442778941a6e83938b1b",
	measurementId: "G-DLVWQQ3E8F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function signInAttempt() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential =
                GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
            const email = error.customData.email;
            const credential =
                GoogleAuthProvider.credentialFromError(error);
        });
    }

export { auth, signInAttempt, onAuthStateChanged, signOut };

// Database
const db = getFirestore(app);
const usersRef = new collection(db, "users");

const leaderboard_query = new query(
	usersRef,
	orderBy("highscore", "desc"),
	limit(5)
);

function getLeaderboard(params) {
	const querySnapshot = getDocs(leaderboard_query);
	return querySnapshot;
}

export { getLeaderboard };

export {
	setDoc,
	getDoc,
	doc,
	db
}
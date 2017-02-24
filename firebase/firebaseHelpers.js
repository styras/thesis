import ReactNative from 'react-native';
import React from 'react';

import firebase from 'firebase';
import config from './config';

export const firebaseRef = firebase.initializeApp(config);
export const firebaseDB = firebaseRef.database();


export function getUserId() {
  const user = firebaseRef.auth().currentUser;
  return user.uid;
}

export function updateUserLocation() {
  navigator.geolocation.getCurrentPosition((position) => {
    let location = position;
    let userID = getUserId();
    let userRef = firebaseDB.ref('users/' + userID);
    userRef.update({ location: location })
      .then(() => {
        console.log('Location update successful!');
      })
      .catch((error) => { console.log(`Location update Error ${error}`); });
    },
    (error) => alert(JSON.stringify(error)),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
  );
}

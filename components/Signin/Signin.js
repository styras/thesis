import React, { Component } from 'react';
import { Alert, View, Image } from 'react-native';
import { Container, Header, Footer, Content, Form, Item, Input, Icon, Button, Text } from 'native-base';
import { firebaseRef, firebaseDB } from '../../firebase/firebaseHelpers';
import GroupView from './../../components/GroupView/GroupView';
import * as Animatable from 'react-native-animatable';

const styles = {
  marginBottom: {
    marginBottom: 10,
  },
};

export default class Signin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      showSignUp: true,
    };

    this._authChangeListener();

    this._handleChangePage = this._handleChangePage.bind(this);
    this.signup = this.signup.bind(this);
    this.signin = this.signin.bind(this);
    this.logout = this.logout.bind(this);
  }

  _authChangeListener() {
    this.unsubscribe = firebaseRef.auth().onAuthStateChanged((user) => {
      if (user) {
        setTimeout(() => {
          firebaseDB.ref(`users/${user.uid}`).once('value')
          .then((snapshot) => { this._handleChangePage(snapshot.val()); });
        }, 1000);
      }
    });
  }

  _sendSignInAlert(error) {
    Alert.alert(
      'Oooops',
      `\nLooks like there was a problem. Are you already a member? Double check your inputs, and please try your request again.\n\n${error}`,
      { cancelable: false },
    );
  }

  _sendLogOutAlert(error) {
    Alert.alert(
      'Log Out Failure',
      `\nThere was an error with logging you out.\n\n${error}`,
      { cancelable: false },
    );
  }

  _handleChangePage(user) {
    // Unsubscribe from auth listener
    this.unsubscribe();

    this.props.navigator.push({
      component: GroupView,
      title: 'Your Groups',
      leftButtonTitle: 'Log Out',
      onLeftButtonPress: () => {
        this.logout();
      },
      passProps: {
        user,
      },
    });
  }

  signup() {
    firebaseRef.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
    .then(() => {
      const user = firebaseRef.auth().currentUser;
      const displayName = user.email.split('@')[0];

      user.updateProfile({
        displayName,
      })
      .then(() => {
        const newUserObj = {
          displayName: user.displayName,
          email: user.email,
          location: {
            coords: {
              accuracy: 5,
              altitude: 0,
              altitudeAccuracy: -1,
              heading: -1,
              latitude: 33.812092,
              longitude: -117.918974,
              speed: -1,
            },
          },
          uid: user.uid,
        };

        firebaseDB.ref(`users/${user.uid}`).set(newUserObj);
      }, (error) => { this._sendSignInAlert(error); });
    })
    .catch((error) => { this._sendSignInAlert(error); });
  }

  signin() {
    firebaseRef.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
    .catch((error) => { this._sendSignInAlert(error); });
  }

  logout() {
    firebaseRef.auth().signOut().then(() => {
      this.setState({
        email: '',
        password: '',
      });
      this.props.navigator.pop();
      this._authChangeListener();
    }, (error) => { this._sendLogOutAlert(error); });
  }

  render() {
    return (
      <Container style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Header />
        <Content style={{ padding: 10 }}>
          <View style={{ width: 350 }}>
            <Animatable.View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
              animation={'fadeIn'}
              duration={2000}
            >
              <Image
                source={require('../../images/logo.png')}
                style={{
                  width: 200,
                  height: 200,
                }}
              />
              <Text
                style={{
                  paddingTop: 10,
                  fontSize: 20,
                }}
              >
              Keep track of <Text style={{ fontStyle: 'italic', fontSize: 20, }}>your</Text> flock!
              </Text>
            </Animatable.View>
            <Form style={{}}>
              <Animatable.View animation={'fadeInUp'} duration={500}>
              <Item style={styles.marginBottom} regular>
                <Input
                  ref={(component) => { this._emailInput = component; }}
                  onChangeText={(text) => { this.setState({ email: text }); }}
                  placeholder={'Email'}
                  autoCapitalize={'none'}
                  value={this.state.email}
                />
                {/.+@.+\..+/i.test(this.state.email) && <Icon name={'checkmark-circle'} style={{ color: 'green' }} />}
              </Item>
              </Animatable.View>
              <Animatable.View animation={'fadeInUp'} delay={200} duration={500}>
              <Item regular>
                <Input
                  ref={(component) => { this._passwordInput = component; }}
                  onChangeText={(text) => { this.setState({ password: text }); }}
                  placeholder={'Password 6+ Characters'}
                  autoCapitalize={'none'}
                  value={this.state.password}
                  secureTextEntry
                />
                {this.state.password.length >= 6 && <Icon name={'checkmark-circle'} style={{ color: 'green' }} />}
                {this.state.password.length <= 5 && this.state.password.length > 0 && <Icon name={'close-circle'} style={{ color: 'red' }} />}
              </Item>
              </Animatable.View>
            </Form>
            <Animatable.View animation={'fadeInUp'} delay={400} duration={500}>
            {this.state.showSignUp ?
              <Button
                style={{ padding: 5, alignSelf: 'center' }}
                onPress={() => this.setState({ showSignUp: false })}
                transparent
              >
                <Text>Already registered?</Text>
              </Button> :
              <Button
                style={{ padding: 5, alignSelf: 'center' }}
                onPress={() => this.setState({ showSignUp: true })}
                transparent
              >
                <Text>{'Don\'t have an account?'}</Text>
              </Button>
            }
            </Animatable.View>
            <Animatable.View animation={'fadeInUp'} delay={600} duration={500}>
            {this.state.showSignUp ?
              <Button
                disabled={this.state.password.length < 6}
                onPress={this.signup}
                style={{ width: 350 }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ textAlign: 'center' }}>Sign up</Text>
                </View>
              </Button> :
              <Button
                disabled={this.state.password.length < 6}
                onPress={this.signin}
                style={{ width: 350 }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ textAlign: 'center' }}>Sign in</Text>
                </View>
              </Button>
            }
            </Animatable.View>
          </View>
        </Content>
        <Footer />
      </Container>
    );
  }
}

Signin.propTypes = {
  navigator: React.PropTypes.object.isRequired,
};

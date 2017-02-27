import React, { Component, CameraRoll } from 'react';
import { StyleSheet, View, TextInput, ListView, Image, Linking, TouchableOpacity } from 'react-native';
import { Button, ListItem, Text, Icon } from 'native-base';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import { firebaseDB } from '../../firebase/firebaseHelpers';

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    borderColor: 'grey',
    borderWidth: 1,
    paddingLeft: 10,
    margin: 10,
  },
  chatInput: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
  },
});

export default class Chat extends Component {
  constructor(props, context) {
    super(props, context);
    this.database = firebaseDB;
    this.state = {
      username: this.props.user ? this.props.user.displayName : 'Anonymous',
      input: '',
      group: this.props.groupName ? this.props.groupName : 'Default',
      messages: [],
      image: 'https://cdn.brainpop.com/science/ecologyandbehavior/foodchains/icon.png',
    };

    this._ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this._chatList = {};
    this.messagesRef = this.database.ref(`messages/${this.state.group}`);
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount() {
    this.messagesListener();
    //Linking.addEventListener('url', this._handleOpenURL);
  }

  componentDidUpdate() {
    this._chatList.scrollTo({ y: 0 });
  }

  componentWillUnmount() {
    this.messagesRef.off('value');
    //Linking.removeEventListener('url', this._handleOpenURL);
  }

  messagesListener() {
    this.messagesRef.on('value', (snapshot) => {
      // Handle no messages created yet...
      if (snapshot.val() === null) {
        this.setState({ messages: [] });
      } else {
        this.setState({ messages: snapshot.val().reverse() });
      }
    });
  }

  sendMessage() {
    // Write a message into database
    // Transaction will allow firebase to queue the requests
    // so messages aren't written at the same time
    this.messagesRef.transaction((messages) => {
      const groupMessages = messages || [];

      groupMessages.push({
        name: this.state.username,
        message: this.state.input,
        timestamp: new Date().getTime(),
      });

      // Clear TextInput
      this.setState({ input: '' });

      return groupMessages;
    });
  }

  _handleOpenURL(url) {
    //console.log('handleOpenURL', url);
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  }

  selectImage() {
    const options = {
      quality: 1.0,
      maxWidth: 375,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          image: source
        });
      }
    });
  }

  render() {
    console.log('IMAGE', this.state.image);
    return (
      <View>
        <View style={{ height: 500 }}>
          <ListView
            enableEmptySections
            renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
            ref={(chatList) => { this._chatList = chatList; }}
            dataSource={this._ds.cloneWithRows(this.state.messages)}
            renderRow={obj =>
              <View>
              <ListItem>
              { !obj.message.includes('http') ?
                <Text style={{ fontSize: 13 }}>
                  {obj.name} ({moment(obj.timestamp).fromNow()}): {obj.message}
                </Text>
                :
                <View>
                  <Text style={{ fontSize: 13 }}>{obj.message.substring(0, obj.message.indexOf('http'))}</Text>
                  <TouchableOpacity
                    onPress={() => this._handleOpenURL(obj.message.substring(obj.message.indexOf('http')))}>
                    <View>
                      <Text>{obj.message.substring(obj.message.indexOf('http'))}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              }
              { this.state.image && <Image source={{uri: this.state.image}} /> }
              <Image source={{uri: this.state.image}} />
              </ListItem>
              </View>
            }
          />
        </View>
        <View style={styles.chatInput}>
          <View style={{ flex: 3, height: 50 }}>
            <TextInput
              style={styles.textInput}
              value={this.state.input}
              onChangeText={t => this.setState({ input: t })}
            />
          </View>
          <View>
            <Icon name="camera" onPress={this.selectImage} style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-between'}} />
          </View>
          <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginTop: 10 }}>
            <Button small onPress={this.sendMessage}>
              <Text style={{ color: 'white' }}>Send</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

Chat.propTypes = {
  user: React.PropTypes.object.isRequired,
  groupName: React.PropTypes.string.isRequired,
};

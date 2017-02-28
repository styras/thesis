import React, { Component } from 'react';
import { ListView, View } from 'react-native';
import { Container, Content, ListItem, Body, Text, CheckBox } from 'native-base';

import Option from './Option';

export default class Poll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.user ? this.props.user.displayName : 'Anonymous',
      group: this.props.groupName ? this.props.groupName : 'Default',
      // dataSource: ds.cloneWithRows([
      //   {text: 'John', votes: 9}, {text: 'Joel', votes: 4}, {text: 'James', votes: 1}, {text: 'Jimmy', votes: 3}, {text: 'Jackson', votes: 6}, {text: 'Jillian', votes: 2}, {text: 'Julie', votes: 5}, {text: 'Devin', votes: 3}
      // ]),
      input: '',
      options: [
         {text: 'John', votes: 9}, {text: 'Joel', votes: 4}, {text: 'James', votes: 1}, {text: 'Jimmy', votes: 3}, {text: 'Jackson', votes: 6}, {text: 'Jillian', votes: 2}, {text: 'Julie', votes: 5}, {text: 'Devin', votes: 3}
      ],
    };
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.handleChecked = this.handleChecked.bind(this);
  }

  //add a poll option
    //text
    //count = 0

  //add or remove votes for an option
  handleChecked(checked) {
    console.log('handleChecked', checked);
    //increase or decrease the vote count for a particular option

  }

  //submit the poll for a user

  //get the poll results

  render() {
    return (
      <Container>
        <Content>
          <View style={{flex: 1, paddingTop: 22}}>
            <ListView
              dataSource={this.ds.cloneWithRows(this.state.options)}
              renderRow={(rowData) =>
                <Option text={rowData.text} votes={rowData.votes} handleChecked={this.handleChecked} />
              }
            />
          </View>
        </Content>
      </Container>
    );
  }
}

Poll.propTypes = {
  user: React.PropTypes.object.isRequired,
  groupName: React.PropTypes.string.isRequired,
};
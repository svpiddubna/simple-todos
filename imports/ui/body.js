import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../api/tasks.js';

import './body.html';
import './task.js';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
});


Template.body.helpers({
  tasks() {
    const instance = Template.instance();
    let conditions = {};
    if (instance.state.get('hideCompleted')) {

      conditions.checked = { $ne: true };
      // If hide completed is checked, filter tasks
      // return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
    }
    if (instance.state.get('searchQuery')) {
      // If hide completed is checked, filter tasks
      conditions.text = { $regex: instance.state.get('searchQuery') };
      // return Tasks.find({ text: { $regex: instance.state.get('searchQuery') } }, { sort: { createdAt: -1 } });
    }
    // Otherwise, return all of the tasks
    return Tasks.find(conditions, { sort: { createdAt: -1 } });
  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }).count();
  },
});
Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const text = target.text.value;

    // Insert a task into the collection
    Meteor.call('tasks.insert', text);

    // Clear form
    target.text.value = '';
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
   'keyup .search input'(event, instance) {
    instance.state.set('searchQuery', event.target.value);
  },
});

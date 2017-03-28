import Ember from "ember";
import KeyCodes from "email-component/utils/key-codes";
const invalidEmailMsg = "Invalid Email(s): ";
// this is tested only in webkit browsers (OS mac/windows)
const pasteKeyCodes = [91 /* left cmd in mac*/ , 93 /* right cmd in mac*/ , 17 /* ctrl in windows*/ ];
export default Ember.Component.extend({

  // ember's component property
  classNames: ["email-list-component"],

  // stores the valid emails entered so far
  emails: [],

  // the current value entered by the user
  inputValue: "",

  // error message which is shown
  invalidEmailMsg: "",

  // actions hash (event handlers)
  actions: {
    onKeyUp(value, event) {
      this.onKeyUp(value, event);
    },

    onInput(event) {
      this.onInput(event);
    },

    deleteEmailToken(value) {
      this.deleteEmailToken(value);
    },
  },

  onPaste(value = "") {
    // if value is not set, or its empty
    if (!value || !value.trim()) {
      return;
    }
    const invalidValues = [];
    const valuesArr = value.trim().split(",");
    valuesArr.forEach(value => {
      const trimmedValue = value.trim();
      if (this.isValidEmail(trimmedValue)) {
        this.updateValidEmails(trimmedValue);
      } else {
        invalidValues.push(trimmedValue);
      }
    });

    if (invalidValues.length) {
      const invalidValuesString = invalidValues.join(",");
      this.set("invalidEmailMsg", `${invalidEmailMsg} ${invalidValuesString}`);
      console.log(`Invalid email entered: ${invalidValuesString}`);
    }
  },

  onKeyUp(value, event = {}) {
    if (!this.isEventTriggeredByPasting(event)) {
      // reset the error message
      this.set("invalidEmailMsg", "");
    }

    const keyCode = Ember.get(event, "which");
    switch (keyCode) {
      case KeyCodes.SPACE:
      case KeyCodes.ENTER:
      case KeyCodes.TAB:
        this.unSelectEmail();
        // if value is not set, or its empty
        if (!value || !value.trim()) {
          return;
        }
        this.tokenizeEmail(value);
        break;

      case KeyCodes.BACKSPACE:
      case KeyCodes.DELETE:
        this.onDelete();
        break;

      default:
        this.unSelectEmail();
        break;
    }
  },

  unSelectEmail() {
    const emails = this.get("emails");
    if (emails.length) {
      const lastEmail = emails[emails.length - 1];
      Ember.set(lastEmail, "selected", false);
    }
  },

  onDelete() {
    const emails = this.get("emails");
    if (emails.length) {
      const lastEmail = emails[emails.length - 1];
      if (Ember.get(lastEmail, "selected")) {
        this.deleteEmailToken(Ember.get(lastEmail, "value"));
      } else {
        Ember.set(lastEmail, "selected", true);
      }
    }
  },

  tokenizeEmail(value = "") {
    if (this.isValidEmail(value)) {
      this.updateValidEmails(value);
      // reset the input value
      this.set("inputValue", "");
    } else {
      this.setProperties({
        inputValue: "",
        invalidEmailMsg: `${invalidEmailMsg} ${value}`,
      });
      // using alert is a not a great idea, so log the error, also show the user error message on the screen
      // window.alert(invalidEmailMsg);
      console.log(invalidEmailMsg);
    }
  },

  isValidEmail(email) {
    const trimmedEmail = email.trim();
    // this is a regex which handles cases defined by html5 spec
    // validating an email using regex is not highly suggested (as none of the regexes are 100%)

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(trimmedEmail);
  },

  updateValidEmails(value) {
    const emails = this.get("emails");
    const isAlreadyAdded = emails.findBy("value", value);
    if (!isAlreadyAdded) {
      emails.addObject({
        value,
      });
    }
  },

  deleteEmailToken(value) {
    const filteredEmails = this.get("emails").rejectBy("value", value);
    this.set("emails", filteredEmails);
  },

  isEventTriggeredByPasting(event) {
    const keyCode = Ember.get(event, "which");
    return pasteKeyCodes.indexOf(keyCode) > -1;
  },

  // Ember Component's lifecyle method
  // https://guides.emberjs.com/v2.6.0/components/the-component-lifecycle
  didInsertElement() {
    // Need a jQuery style paste event, as ember's input helper doesn't support paste event as arguments
    this.$(".email-list-token__input").on("paste", event => {
      const clipboardData = Ember.get(event, "originalEvent.clipboardData");
      if (clipboardData) {
        const pastedValue = clipboardData.getData("text");
        this.onPaste(pastedValue);
      }
      // paste event is fired even before input element value is updated,
      // so wait for some time, and then reset the value of input el
      Ember.run.later(() => {
        this.set("inputValue", "");
      }, 100);
    });
  },

});

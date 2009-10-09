var ActiveKeyboard = Class.create(EventDispatcher, (function(){
  var _hotkeys = $A([]);

  var _instance = null;

  var _isActive = false;
  var _initialized = false;
  var _initialize = function() {
    return _initialized || (function(){
      _initialized=true;
      return false;
    }());
  };

  var _hasShortcut = function(hotkey) {
    return (_hotkeys.pluck('trigger').include(hotkey.trigger))
  };

  var _translateKeys = function(event) {
    return ((event.ctrlKey)? "Ctrl+": "") +
        ((event.altKey)? "Alt+": "") +
        ((event.shiftKey)? "Shift+": "") +
        (Event['KEY_' + event.keyCode] || String.fromCharCode(event.keyCode).toUpperCase());
  };


  return {
    initialize: function($super) {
      if(Object.isUndefined(ActiveKeyboard.instance)) {
        $super(); 
      }
      else {
        alert('do not initialize ActiveKeyboard intance, use getInstance() instead');
        return;
      }
    },
    enable: function() {
      if((_initialize() || this._createListener()) && _isActive == false) {
        Event.observe(document, "keydown", this.handleKeyDownHandler);
        _isActive = true;
      }
    },
    getStatus: function() {
      return _isActive;
    },
    disable: function() {
      if(_isActive == true) {
        _isActive = false;
        Event.stopObserving(document, "keydown", this.handleKeyDownHandler);
      }
    },
    handleKeyDown: function(event) {
      this.dispatchEvent(_translateKeys(event), event);
    },
    _createListener: function() {
      this.handleKeyDownHandler = this.handleKeyDown.bindAsEventListener(this);
      return true;
    },
    addShortCut: function(trigger, func) {
      var hotkey = new ActiveKeyboard.HotKey(trigger, func);
      if(hotkey == null) {
        alert('could not initialize ShortCut ['+trigger+']');
        return;
      }
      if(_hasShortcut(hotkey)) {
        alert('['+hotkey.getTrigger()+'] already active');
        return;
      }

      _hotkeys.push(hotkey);
      this.addEventListener(hotkey.getTrigger(), hotkey.getExec());
    },
    disableHotKey: function(trigger) {
      if(this.hasEventListener(trigger)) {
        for(t in _hotkeys) {
          if(t == trigger) {
            this.removeEventListener(t, this._hotkeys[t]);
            this._hotkeys = this._hotkeys.without(t);
          }
        }
      }
    }
  }
})());

ActiveKeyboard.getInstance = function() {
  if(Object.isUndefined(ActiveKeyboard.instance)) {
    ActiveKeyboard.instance = new ActiveKeyboard();
  }
  return ActiveKeyboard.instance;
};

ActiveKeyboard.HotKey = Class.create(function() {
  return {
    initialize: function(trigger, func) {
      if(!trigger || func == 'undefined') return null;

      this.options = Object.extend({
        shiftKey: false,
        altKey: false,
        ctrlKey: false
      },this._readTrigger(trigger) || {});

      this.letter = this.options.letter;
      this.callback = func;

      this.trigger = (((this.options.ctrlKey)? "Ctrl+": "") +
            ((this.options.altKey)? "Alt+": "") +
            ((this.options.shiftKey)? "Shift+": "") +
            this.letter);
    },
    // returns objects representation of the trigger
    // ex 'Ctrl+Shift+a' -> {shiftKey: true, ctrlKey: true, letter: 'A'}
    // ex 'Alt+Tab' -> {altKey: true, letter: 'TAB'}
    _readTrigger: function(trigger) {
      // remove any whitespace
      trigger = trigger.replace(/\s+/g, "");

      var options = {};
      var keys = trigger.split('+');

      // last one is the letter
      options.letter = keys.pop().toUpperCase();

      // rest are the swtiches
      keys.each(function(e) {eval('options.'+e.toLowerCase()+'Key=true')});

      return options;
    },
    // returns string value of the trigger based on the object's options
    // as supported internally in the Keyboard object
    // ex: Ctrl+Alt+Shift+#{letter}
    getTrigger: function() {
      return this.trigger;
    },
    getExec: function() {
      return this.callback;
    }
  }
}());

// 'special' keys
Object.extend(Event, {
  KEY_8   :   'BACKSPACE',
  KEY_9   :   'TAB',
  KEY_13  :  'RETURN',
  KEY_27  :  'ESC',
  KEY_37  :  'LEFT',
  KEY_38  :  'UP',
  KEY_39  :  'RIGHT',
  KEY_40  :  'DOWN',
  KEY_46  :  'DELETE',
  KEY_36  :  'HOME',
  KEY_35  :  'END',
  KEY_33  :  'PAGEUP',
  KEY_34  :  'PAGEDOWN',
  KEY_45  :  'INSERT', 
  KEY_112 : "F1",
  KEY_113 : "F2",
  KEY_114 : "F3",
  KEY_115 : "F4",
  KEY_116 : "F5",
  KEY_117 : "F6",
  KEY_118 : "F7",
  KEY_119 : "F8",
  KEY_120 : "F9",
  KEY_121 : "F10",
  KEY_122 : "F11",
  KEY_123 : "F12", 


  // Ctrl Alt Shif
  KEY_17:  '()',
  KEY_18:  '()',
  KEY_16:  '()'
});


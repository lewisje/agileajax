/*
<div id='container'>
  <div id='menuitem'>
    <div id='menuitem-label' class='accordion-toggle'>header of menu</div>
    <div id='menuitem-content' class='accordion-content'>content of menu</div>
  </div>
</div>
// new AccordionMenu('container').activate('menuitem');
*/
AccordionMenu = Class.create(EventDispatcher, (function(){
  var menuInFocus = null; // id
  var animating = false;  // menu is in action
  
  function _toggle(menuToFocus) {
    if (this.animating)  return false;
    
    // no menu in focus
    if(this.menuInFocus == null) {
      new Effect.BlindDown(menuToFocus+'-content', 
        {
          duration: 0.4,
          beforeStart: function() {
            this.animating = true;
            $(menuToFocus+'-label').toggleClassName('accordion-toggle-active');
          }.bind(this),        
          afterFinish: function() {
            this.animating = false;
            this.fire('accordionOpenning', menuToFocus);
            this.menuInFocus = menuToFocus;
          }.bind(this)
        }
      );
    }
    else

    // clicked on the focused menu
    if(this.menuInFocus == menuToFocus) {
      new Effect.BlindUp(menuToFocus+'-content', 
        {
          duration: 0.4,
          beforeStart: function() {
            this.animating = true;
            $(menuToFocus+'-label').toggleClassName('accordion-toggle-active');                      
          }.bind(this),        
          afterFinish: function() {
            this.animating = false;            
            this.fire('accordionClosing', menuToFocus);            
            this.menuInFocus = null;
          }.bind(this)
        }
      );
    }

    // menu focused, clicked on another
    else {
      new Effect.Parallel(
        [
          new Effect.BlindDown(menuToFocus+'-content'),
          new Effect.BlindUp(this.menuInFocus+'-content')
        ], 
        {
          duration: 0.4,
          beforeStart: function() {
            this.animating = true;            
            $(menuToFocus+'-label').toggleClassName('accordion-toggle-active');
            $(this.menuInFocus+'-label').toggleClassName('accordion-toggle-active');
            
          }.bind(this),        
          afterFinish: function() {
            this.animating = false;            
            this.fire('accordionOpenning', menuToFocus);
            this.fire('accordionClosing', this.menuInFocus);            
            this.menuInFocus = menuToFocus;
          }.bind(this)
        }
      );
    }
  };
  
  // do nothing 
  function _hover(menuHovered) { };
  
  return {
    initialize: function($super, container) {
      $super();
      this.container = $(container);
    },

    activate: function(menuToFocus) {
      var menuItems = this.container.childElements();
      menuItems.each(function(e) {this.addMenuItem(e.id)}, this);
      
      if(menuToFocus) this.toggle(menuToFocus);

      return this;
    },
    
    addMenuItem: function(menuItemId) {
      var menuLabel   = $(menuItemId+'-label');
      var menuContent = $(menuItemId+'-content');
      
      menuLabel.observe('mouseover', this.hover.bind(this, menuItemId));
      menuLabel.observe('click',     this.toggle.bind(this, menuItemId));
      
      menuLabel.onclick = function() {return false;};
      menuContent.setStyle({display:'none'});
    },
    toggle: _toggle,
    hover: _hover
  }
})());


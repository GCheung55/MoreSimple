/*  TextOverlay
*
*   To display overlaying text above an input
*   Simplified from Aaron Newton/MooTools-More OverText Class
*
*   MIT-Style license.
*
*   @author Garrick Cheung garrick.cheung@cbs.com
*   @argument element {element} Element that you pass in that needs the overlaying text
*   @argument overtext {element} Element that will be the overlaying text. This allows for customized implementation
*   @argument options {object literal} Optional params
*       - poll {boolean} default:false When set to true, a continous change-check will be made on the element
*       - pollInterval {int} default:250 Value used for polling interval, in milliseconds
*       - onFocus {function} Event
*       - onTextHide {function} Event
*       - onTextShow {function} Event
*
*   @requires Options, Events, Class.Occlude, Binds
*/

var TextOverlay = new Class({
    Implements: [Options, Events, Class.Occlude],

    Binds: ['assert', 'focus'],

    property:'TextOverlay',

    options: {
        /*onFocus: $empty(),*/
        onTextHide: function(element, text){
            text.setStyle('display','none');
        },
        onTextShow: function(element, text){
            text.setStyle('display','block');
        },
        poll: false,
        pollInterval: 250
    },

    initialize: function(element, overtext, options){
        if(!element && !overtext){
            return false;
        }
        this.element = $(element);
        if (this.occlude()) return this.occluded;
        this.overtext = $(overtext);
        this.setOptions(options);
        this.attach(this.element);
        if(this.options.poll){
            this.poll();
        }
    },

    toElement: function(){
        return this.element;
    },

    attach: function(){
        this.overtext.addEvents({
            click: this.hide.bind(this)
        });

        this.element.addEvents({
            focus: this.focus,
            blur: this.assert,
            change: this.assert
        }).store('TextOverlay', this);
        this.assert();
    },

    hide: function(){
        if(this.visible && !this.element.get('disabled')){
            this.fireEvent('textHide', [this.element, this.overtext]);
            this.visible = false;
            this.pollingPaused = true;
            try{
                this.element.fireEvent('focus').focus();
            } catch(e){}
        }
        return this;
    },

    show: function(){
        if(!this.visible){
            this.fireEvent('textShow', [this.element, this.overtext]);
            this.visible = true;
            this.pollingPaused = false;
        }
        return this;
    },

    focus: function(){
        if(!this.visible && this.element.get('disabled')){
            return;
        }
        this.hide();
    },

    assert: function(){
        this[this.test() ? 'show' : 'hide']();
    },

    test: function(){
        return !this.element.get('value');
    },

    poll: function(stop){
        if(this.poller && !stop){
            return this;
        }
        if(stop){
            $clear(this.poller);
        }else{
            this.poller = function(){
                if(!this.pollingPaused){
                    this.assert();
                }
            }.periodical(this.options.pollInterval, this);
        }
        return this;
    },

    stopPolling: function(){
        this.pollingPaused = true;
        return this.poll(true);
    },

    startPolling: function(){
        this.pollingPaused = false;
        return this.poll();
    }

});
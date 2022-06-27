let domInterfaceStrings = [
    'Attr',
    'CDATASection',
    'CharacterData',
    'ChildNode', 
    'Comment',
    'CustomEvent',
    'Document',
    'DocumentFragment',
    'DocumentType',
    'DOMError', 
    'DOMException',
    'DOMImplementation',
    'DOMString',
    'DOMTimeStamp',
    'DOMStringList',
    'DOMTokenList',
    'Element',
    'Event',
    'EventTarget',
    'HTMLCollection',
    'MutationObserver',
    'MutationRecord',
    'NamedNodeMap',
    'Node',
    'NodeFilter',
    'NodeIterator',
    'NodeList',
    'ProcessingInstruction',
    'Selection', 
    'Range',
    'Text',
    'TextDecoder', 
    'TextEncoder', 
    'TimeRanges',
    'TreeWalker',
    'URL',
    'Window',
    'Worker',
    'XMLDocument'
  ]


  let reservedObjects = [ //unused
    'window', 
    'console', 
    'global', 
    'document', 
    'Infinity',
    'NaN',
    'undefined',
    'globalThis',
    'Object', 
    'Function', 
    'Boolean', 
    'Symbol', 
    'Error', 
    'AggregateError',
    'EvalError',
    'InternalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError',
    'Number',
    'BigInt',
    'Math',
    'Date',
    'String',
    'RegExp',
    'Array',
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array',
    'BigInt64Array',
    'BigUint64Array',
    'Promise',
    'Generator',
    'GeneratorFunction',
    'AsyncFunction',
    'Reflect',
    'Proxy',
    'Intl',
    'WebAssembly',
    'arguments', 
    'screen',
    // JS LIBRARIES USING
    'WebMidi',
    'program',
    'Babel'
  ];


  let event_list = [
    'abort',
    'afterprint',
    'animationend',
    'animationiteration',
    'animationstart',
    'beforeprint',
    'beforeunload',
    'blur',
    'canplay',
    'canplaythrough',
    'change',
    'click',
    'contextmenu',
    'copy',
    'cut',
    'dblclick',
    'drag',
    'dragend',
    'dragenter',
    'dragleave',
    'dragover',
    'dragstart',
    'drop',
    'durationchange',
    'ended',
    'error',
    'focus',
    'focusin',
    'focusout',
    'fullscreenchange',
    'fullscreenerror',
    'hashchange',
    'input',
    'invalid',
    'keydown',
    'keypress',
    'keyup',
    'load',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'message',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseover',
    'mouseout',
    'mouseup',
    'mousewheel',
    'offline',
    'online',
    'open',
    'pagehide',
    'pageshow',
    'paste',
    'pause',
    'play',
    'playing',
    'popstate',
    'progress',
    'ratechange',
    'resize',
    'reset',
    'scroll',
    'search',
    'seeked',
    'seeking',
    'select',
    'show',
    'stalled',
    'storage',
    'submit',
    'suspend',
    'timeupdate',
    'toggle',
    'touchcancel',
    'touchend',
    'touchmove',
    'touchstart',
    'transitionend',
    'unload',
    'volumechange',
    'waiting',
    'wheel'
  ]

  export { domInterfaceStrings, reservedObjects, event_list}
/*
 *	JadeServer.ts
 *
 *  This file is structured for easy viewing and editing and uses functions
 *  so we can 'fold' the contents and use the 'outline' for quick lookup
 */

 const getDictionary = (): string => { return `getDictionary: aSymbolDictionary
 | comma dict stream |
 stream := WriteStream on: String new.
 stream nextPutAll: '{"list":['.
 comma := ''.
 aSymbolDictionary keysAndValuesDo: [:eachKey :eachValue | 
     stream 
         nextPutAll: comma;
         nextPutAll: '{"key":"';
         nextPutAll: eachKey asString;
         nextPutAll: '","oop":';
         print: eachValue asOop;
         nextPutAll: ',"class":"';
         nextPutAll: eachValue class name asString;
         nextPutAll: '","classOop":';
         print: eachValue class asOop;
         nextPutAll: '}';
         yourself.
     comma := ','.
 ].
 stream nextPutAll: ']}'.
 ^stream contents.`;
};
 const getSymbolList = (): string => {return `getSymbolList 
 | comma stream |
 stream := WriteStream on: String new.
 stream nextPutAll: '{"list":['.
 comma := ''.
 System myUserProfile symbolList do: [:each | 
 stream 
     nextPutAll: comma;
     nextPutAll: '{"oop":';
     print: each asOop;
     nextPutAll: ',"name":"';
     nextPutAll: each name;
     nextPutAll: '","size":';
     print: each size;
     nextPutAll: '}';
     yourself.
 comma := ','.
 ].
 stream nextPutAll: ']}'.
 ^stream contents.`;
};

// list the methods
const methods = [
    getDictionary(),
    getSymbolList()
];

// this puts it all together
const getCode = (): string => {
let code = `
| class result server source symbolList |
symbolList := (AllUsers userWithId: 'DataCurator') symbolList.
symbolList := symbolList class new 
    add: (symbolList detect: [:each | each name == #UserGlobals]); 
    add: (symbolList detect: [:each | each name == #Globals]); 
    yourself.
[
    class := symbolList objectNamed: #Object.
    class := class subclass: 'JadeServer'
		instVarNames: #()
		classVars: #()
		classInstVars: #()
		poolDictionaries: (#() class withAll: symbolList)
        inDictionary: SymbolDictionary new.
`;
methods.forEach(element => {
    code = code + `source := '` + element.replace(new RegExp(`'`, 'g'), `''`) + `'.
    result := class
		compileMethod: source
		dictionaries: symbolList
		category: 'category'.
    result ~~ nil ifTrue: [^GsNMethod _sourceWithErrors: result fromString: source].`;
});
    code = code + `
    class new "initialize"
] on: (symbolList objectNamed: #Error) do: [:ex | 
    ex return: 'ERROR: ' , (GsProcess stackReportToLevel: 100)
]`;
return code;
};

// the result is simply a string of Smalltalk code
export default getCode();
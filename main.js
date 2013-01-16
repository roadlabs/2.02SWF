var fs = require('fs');
var projJSON = JSON.parse(fs.readFileSync(GetInflatedFile("project.json")).toString());
var loadNum = -1;


console.log(GenerateAS3Code());


function GetInflatedFile(f){
    return process.argv[2]+".esb2/"+f;
}

function SpaceAlt(str){
    return str.replace(" ","sp");
}

function ComputeAssetName(obj){
    var type = "baseLayer";
    if(obj.costumeName === "undefined")
        type = "";
   var retVal = obj[type+"ID"];
   var thash = obj[type+"MD5"];
   retVal += thash.substr(thash.length - 4);
   return retVal;
}

function PathStringify(path){
    var ret = path.replace('.','DOT');
    ret = ret.replace('png','PNG');
    ret = ret.replace('svg','SVG');
    ret = ret.replace('wav','WAV');
    ret = ret.replace('1','one');
    ret = ret.replace('2','two');
    ret = ret.replace('3','three');
    ret = ret.replace('4','four');
    ret = ret.replace('5','five');
    ret = ret.replace('6','six');
    ret = ret.replace('7','seven');
    ret = ret.replace('8','eight');
    ret = ret.replace('9','nine');
    ret = ret.replace('0','zero');

    return ret;
}

function GenAssetEmbedCode(assetName,prefix){
    if(typeof(prefix)==='undefined') prefix = "";
    return prefix+"[Embed (source=\""+assetName+"\")]\n"+prefix+"public static const "+PathStringify(assetName)+":Class;\n";
}

function GenAssetLoadCode(path, spr, prefix){
    if(typeof(prefix)==='undefined') prefix = "";
    loadNum++;
    var retVal = prefix+"var loader"+loadNum+":Loader = new Loader();\n"+prefix+"loader"+loadNum+".contentLoaderInfo.addEventListener(Event.COMPLETE, function(e:Event){ \n"+prefix+"       "+spr+".beginBitmapFill(e.target.content.bitmapData);\n"+prefix+"       "+spr+".drawRect(0,0,e.target.content.bitmapData.width,e.taregt.content.bitmapData.height);\n"+prefix+"       "+spr+".endFill();\n"+prefix+"});\n"+prefix+"loader"+loadNum+".load(new URLRequest(\""+path+"\"));\n";
    return retVal;
}

function GenerateSpriteConstructor(sprObj){
     var myID = SpaceAlt(sprObj.objName);
     var retStr = "                   sprites[\""+myID+"\"] = new "+PathStringify(ComputeAssetName(sprObj.costumes[sprObj.currentCostumeIndex]))+"();\n";
     //retStr += GenAssetLoadCode(ComputeAssetName(sprObj.costumes[0]),"sprites[\""+myID+"\"]","                   ");
     retStr += "                   sprites[\""+myID+"\"].x = "+(parseInt(sprObj.scratchX)+240-sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterX)+";\n";
     retStr += "                   sprites[\""+myID+"\"].y = "+(parseInt(sprObj.scratchY)+180-sprObj.costumes[sprObj.currentCostumeIndex].rotationCenterY)+";\n";
     retStr += "                   addChild(sprites[\""+myID+"\"]);\n";
     return retStr;
}

function GenerateBackgroundConstructor(){
    var retStr = "                   background = new "+PathStringify(ComputeAssetName(projJSON.costumes[projJSON.currentCostumeIndex]))+"();\n";
    retStr += "                   background.x = 0;\n                   background.y = 0;\n                   addChild(background);\n";
    return retStr;
}

function GenerateMainConstructor(){
    var retStr = "\n";
    retStr += GenerateBackgroundConstructor();
    var i = 0;
    while(i < projJSON.children.length){
        retStr = retStr + GenerateSpriteConstructor(projJSON.children[i]);
        
        ++i;
    }
    retStr += "                }\n";
    return retStr;
}

function GenerateAS3Code(){
   // return "package{\n  import flash.display.Sprite;\n\n    public class "+process.argv[2]+" extends Sprite{\n      //variables here\n\n        public function "+process.argv[2]+"():void {\n          //stuff\n       }\n     }\n}";
    var retVal = "package{\n\
        import flash.display.Sprite;\n\
        \n\
        [SWF(width='480', height='360', backgroundColor='#ffffff', frameRate='30')]\n\
        \n\
        public class "+process.argv[2]+" extends Sprite{\n";
    var i = 0;
    while(i < projJSON.children.length){
        var j = 0;
        while(j < projJSON.children[i].costumes.length){
            retVal += GenAssetEmbedCode(ComputeAssetName(projJSON.children[i].costumes[j]), "                ");
            ++j;
        }
        ++i;
    }
    i = 0;
    while(i < projJSON.costumes.length){
        retVal += GenAssetEmbedCode(ComputeAssetName(projJSON.costumes[i]), "                ");
        ++i;
    }
    retVal += "\n\
                public var background;\n\
                public var sprites:Object = new Object();\n\
                \n\
                public function "+process.argv[2]+"():void {";
    retVal += GenerateMainConstructor();
    retVal += "\
        }\n\
}";
    return retVal;

}


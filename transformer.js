/**
 * Created by tengfei.ma on 2016/7/14.
 */

function transform(content){
    let tagObject = parseContent(content);
    let outContent = toString(tagObject.value);

    return outContent;
}

//(type props children)

function parseContent(content){
    let tokens = tokenize(content);

    if(isJSXExp(tokens)){
        return parseATag(tokens);
    }
    else{
        console.log('Error Found...');
    }
}

function toString(tagObj){
    //input: {type:type,props:props,children:children}
    //output: React.createElement(tagObj.type,tagObj.props,tagObj.children)
    if(typeof tagObj.children[0] == 'object'){
        return "React.createElement(\"" + tagObj.type + "\"," + JSON.stringify(tagObj.props) + "," + children2String(tagObj.children) + ")";
    }
    else{
        return "React.createElement(\"" + tagObj.type + "\"," + JSON.stringify(tagObj.props) + ",\"" + tagObj.children[0] + "\")";
    }
}

function children2String(children){
    //input: [{},{}]
    //output:
    return children.reduce(function(result,child){
        return result + toString(child) + ",";
    },"");

}

function isJSXExp(tokens){
    if(tokens[0] === "<" && tokens[tokens.length-1] === ">"){
        return true;
    }
    else{
        return false;
    }
}

function parseATag(tokens){
    return parseATag2(tokens,0);
}

function parseATag2(tokens,idx){
    //input: ["<","div","abc","=",""hehe"","def","=",""haha"",">","尼玛","<","/div",">"]
    let type = tokens[idx + 1];
    let props = parseProps(tokens,idx + 2);
    let children = parseChildren(tokens,props.newIdx + 1);
    let element = {
        type:type,
        props:props.value,
        children:children.map(function(child){return child.value})
    };

    return new ParserItem(element,children[children.length-1].newIdx);
}

function ParserItem(value,newIdx){
    this.value = value || {};
    this.newIdx = newIdx || {};
}

function parseProps(tokens,idx){
    let props = new ParserItem();
    for(var i = idx;i < tokens.length-3;i+=3){
        let tokenKey = tokens[i];
        let tokenValue = tokens[i+2];

        if(tokenKey === '>'){
            props.newIdx = i;
            return props;
        }
        else{
            props.value[tokenKey] = tokenValue;
        }
    }
    //console.log("Error Found");
}

function parseChildren(tokens,idx){
    let token = tokens[idx];
    if(token === '<'){
        let tagToken = parseATag2(tokens,idx);
        let childrens = [];
        childrens.push(tagToken);
        if(tokens[tagToken.newIdx][0] === '/'){
            return childrens;
        }
        else{
            let restItems = parseChildren(tokens,tagToken.newIdx + 3);
            return childrens.concat(restItems);
        }
    }
    else{
        let item = [token];
        item.newIdx = idx + 1;
        return item;
    }
}

function tokenize(content){
    //input: <div abc="hehe" def="haha">尼玛</div>
    //output: ["<","div","abc","=",""hehe"","def","=",""haha"",">","尼玛","<","/div",">"]

    let outputTokens = [];
    for(let idx = 0; idx < content.length; ++idx){
        let char = content[idx];
        if(isBlank(char)) {
            //空格换行直接跳过
        }
        else if(isSeperator(char)){
            outputTokens.push(char);
        }
        else{
            let word = readAWrod(content,idx);
            outputTokens.push(word);
            idx += word.length - 1;
        }
    }
    return outputTokens;
}

function readAWrod(content,idx){
    let word = "";
    for(let idx2 = idx;idx2 < content.length;++idx2){
        let char = content[idx2];
        if(!isSeperator(char) && !isBlank(char)){
            word += char;
        }
        else{
            return word;
        }
    }
}

function isBlank(char){
    if(char === " " || char === "\r" || char === "\n"){
        return true;
    }
    else{
        return false;
    }
}

function isSeperator(char){
    if(char === ' ' || char === '<' || char === '>' || char === '='){
        return true;
    }
    else{
        return false;
    }
}

if(typeof module != 'undefined'){
    module.exports = transform;
}
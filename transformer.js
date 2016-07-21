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
    if(typeof tagObj.children == 'string'){
        return "React.createElement(\"" + tagObj.type + "\"," + JSON.stringify(tagObj.props) + ",\"" + tagObj.children + "\")";
    }
    else{
        return "React.createElement(\"" + tagObj.type + "\"," + JSON.stringify(tagObj.props) + "," + tagObj.children.map(toString).join(',') + ")";
    }
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

function ParserItem(value,newIdx){
    this.value = value || {};
    this.newIdx = newIdx || {};
}

function parseATag2(tokens,idx){
    //input: ["<","div","abc","=",""hehe"","def","=",""haha"",">","尼玛","<","/div",">"]
    let type = tokens[idx + 1];
    let propsItem = parseProps(tokens,idx + 2);
    let childrenItem = parseChildren(tokens,propsItem.newIdx + 1);
    let element = {
        type:type,
        props:propsItem.value,
        children:childrenItem.value
    };

    return new ParserItem(element,childrenItem.newIdx + 3);
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
        let childrens = [tagToken.value];
        if(tokens[tagToken.newIdx + 1][0] === '/'){
            return new ParserItem(childrens,tagToken.newIdx);
        }
        else{
            let restItems = parseChildren(tokens,tagToken.newIdx);
            return new ParserItem(childrens.concat(restItems.value),restItems.newIdx);
        }
    }
    else{
        return new ParserItem(token,idx + 1);
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
/** 秀スクリプト ... TypeScriptライクなスクリプト言語から秀丸マクロを生成
 * v1.0.0
 */
var symNew = 0;
var symVar = 1;
var symNumber = 2;
var symBoolean = 3;
var symString = 4;
var symVoid = 5;
var symFunction = 6;
var symReturn = 7;
var symIf = 8;
var symElse = 9;
var symWhile = 10;
var symDo = 11;
var symBreak = 12;
var symContinue = 13;
var symDummy = 14;
var symDigit = 20;
var symStringLiteral = 21;
var symIdent = 22;
var symComma = 23;
var symSemicolon = 24;
var symColon = 25;
var symAssignment = 26;
var symLambdaOp = 27;
var symUnaryOp = 30;
var symBinaryOp = 31;
var symAddOp = 32;
var symLParen = 40;
var symRParen = 41;
var symLCurlyBrace = 42;
var symRCurlyBrace = 43;
var symLBracket = 44;
var symRBracket = 45;
var symEOF = 46;
var escapeChar = "\\";
var keyword = new Array();
var symTable = new Array();
keyword[symNew] = "new";
keyword[symVar] = "var";
keyword[symNumber] = "number";
keyword[symBoolean] = "boolean";
keyword[symString] = "string";
keyword[symVoid] = "void";
keyword[symFunction] = "function";
keyword[symReturn] = "return";
keyword[symIf] = "if";
keyword[symElse] = "else";
keyword[symWhile] = "while";
keyword[symDo] = "do";
keyword[symBreak] = "break";
keyword[symContinue] = "continue";
keyword[symDummy] = "$$dummy";
var keywordStart = symNew;
var keywordEnd = symDummy;
var operators = new Array();
var opPriority = new Array();
var hidePriority = new Array();
//                      opPriority == 1 は、++ や -- のために予約
operators[0] = "!";
opPriority[0] = 2;
hidePriority[0] = "5";
operators[1] = "*";
opPriority[1] = 3;
hidePriority[1] = "1";
operators[2] = "/";
opPriority[2] = 3;
hidePriority[2] = "1";
operators[3] = "%";
opPriority[3] = 3;
hidePriority[3] = "1";
operators[4] = "+";
opPriority[4] = 4;
hidePriority[4] = "2";
operators[5] = "-";
opPriority[5] = 4;
hidePriority[5] = "2";
operators[6] = "<";
opPriority[6] = 5;
hidePriority[6] = "3";
operators[7] = "<=";
opPriority[7] = 5;
hidePriority[7] = "3";
operators[8] = ">";
opPriority[8] = 5;
hidePriority[8] = "3";
operators[9] = ">=";
opPriority[9] = 5;
hidePriority[9] = "3";
operators[10] = "==";
opPriority[10] = 6;
hidePriority[10] = "3";
operators[11] = "!=";
opPriority[11] = 6;
hidePriority[11] = "3";
operators[12] = "&";
opPriority[12] = 7;
hidePriority[12] = "1";
operators[13] = "^";
opPriority[13] = 8;
hidePriority[13] = "1";
operators[14] = "|";
opPriority[14] = 9;
hidePriority[14] = "1";
operators[15] = "&&";
opPriority[15] = 10;
hidePriority[15] = "4";
operators[16] = "||";
opPriority[16] = 11;
hidePriority[16] = "4";
var opStart = 0;
var opEnd = 17;
var ch = "";
var srcText;
var symKind;
var operator; // 演算子 ">=" 等
var ident; // 識別子
var digitValue; // 文字列のまま扱っても良かったので変更する  number; // 数値
var stringValue; // 文字列リテラル
// 以下は識別子情報
var currentLevel = 0;
var identsName = new Array();
var identsType = new Array();
var identsLevel = new Array();
var nIdents = 0;
var currentFuncType = ""; // 現在の関数の型 s n v のいずれか
function syntaxError(msg) {
    message(msg);
    message(wcsmidstr(srcText, 0, 100));
    symKind = symEOF;
    endmacro();
}
function searchIdent(varName) {
    var i = nIdents - 1;
    while (i >= 0) {
        if (identsName[i] == varName)
            return i;
        i = i - 1;
    }
    return -1;
}
function duplicateCheck(varName, level) {
    var pos = searchIdent(varName);
    if (pos < 0)
        return 1;
    if (identsLevel[pos] == level)
        return 0;
    if (identsLevel[pos] == 0)
        return 1;
    if (level == 0)
        return 1;
    return 0; //値が重複していて、レベルが 引数とローカルの場合は NG
}
/*
 * typeName : n .. number  s .. string   f .. function
 *
 */
function register(varName, typeName, level) {
    if (!duplicateCheck(varName, level))
        syntaxError("識別子 " + varName + " が重複して宣言されています");
    identsName[nIdents] = varName;
    identsType[nIdents] = typeName;
    identsLevel[nIdents] = level;
    var retval = nIdents;
    nIdents = nIdents + 1;
    return retval;
}
function registerBuiltinFunction(name, types) {
    register(name, "F" + types, 0);
}
// 以下、組み込み関数の宣言
//
registerBuiltinFunction("basename", "s");
registerBuiltinFunction("closehidemaru", "vn");
registerBuiltinFunction("_delete", "v");
registerBuiltinFunction("disabledraw", "v");
registerBuiltinFunction("down", "v");
registerBuiltinFunction("enabledraw", "v");
registerBuiltinFunction("endmacro", "v");
registerBuiltinFunction("filename", "s");
registerBuiltinFunction("findhidemaru", "ns");
registerBuiltinFunction("gettext", "snnnnN");
registerBuiltinFunction("grep", "vsss!");
registerBuiltinFunction("insert", "vs");
registerBuiltinFunction("insertln", ""); // 特殊組み込み関数
registerBuiltinFunction("macrodir", "s");
registerBuiltinFunction("message", "vs");
registerBuiltinFunction("openfile", "vs");
registerBuiltinFunction("quit", "v");
registerBuiltinFunction("replaceall", "vss!");
registerBuiltinFunction("result", "n");
registerBuiltinFunction("run", "vs");
registerBuiltinFunction("runsync", "vs");
registerBuiltinFunction("runsync2", "vs");
registerBuiltinFunction("save", "v");
registerBuiltinFunction("saveas", "vs");
registerBuiltinFunction("saveexit", "v");
registerBuiltinFunction("searchdown", "vs!");
registerBuiltinFunction("selectall", "v");
registerBuiltinFunction("selendx", "n");
registerBuiltinFunction("selendy", "n");
registerBuiltinFunction("seltopx", "n");
registerBuiltinFunction("seltopy", "n");
registerBuiltinFunction("setactivehidemaru", "vn");
registerBuiltinFunction("sprintf", "ssNNNN");
registerBuiltinFunction("str", "sn");
registerBuiltinFunction("tickcount", "n");
registerBuiltinFunction("tolower", "ss");
registerBuiltinFunction("unicode", "ns");
registerBuiltinFunction("val", "ns");
registerBuiltinFunction("version", "n");
registerBuiltinFunction("wcsleftstr", "ssn");
registerBuiltinFunction("wcslen", "ns");
registerBuiltinFunction("wcsmidstr", "ssnN");
registerBuiltinFunction("wcsstrrstr", "nss");
registerBuiltinFunction("wcsstrstr", "nss");
function isAlpha(chx) {
    return (chx >= "A" && chx <= "Z") || (chx >= "a" && chx <= "z");
}
function isAlnum(chx) {
    return (chx >= "A" && chx <= "Z") || (chx >= "a" && chx <= "z") || (chx >= "0" && chx <= "9");
}
function isDigit(chx) {
    return (chx >= "0" && chx <= "9");
}
function isHex(chx) {
    return (chx >= "A" && chx <= "F") || (chx >= "a" && chx <= "f") || (chx >= "0" && chx <= "9");
}
function nextChar() {
    ch = wcsmidstr(srcText, 0, 1);
    srcText = wcsmidstr(srcText, 1);
    return ch;
}
function nextSym() {
    var oldSym = symKind;
    while (1) {
        while (ch == " " || ch == "\t" || ch == "\r" || ch == "\n") {
            ch = nextChar();
        }
        if (ch == "") {
            symKind = symEOF;
            return;
        }
        if (ch == '/') {
            nextChar();
            if (ch == "/") {
                var term = "";
                do {
                    ch = nextChar();
                    term = term + ch;
                    if (term == "EOF") {
                        symKind = symEOF;
                        return;
                    }
                } while (ch != '\n' && ch != "");
                continue;
            }
            else if (ch == "*") {
                nextChar();
                while (1) {
                    if (ch == "") {
                        syntaxError("コメントが閉じられないままEOFに達しました");
                        return;
                    }
                    else if (ch == '*') {
                        nextChar();
                        if (ch == '/') {
                            nextChar();
                            break;
                        }
                    }
                    else
                        nextChar();
                }
                continue;
            }
            else {
                symKind = symBinaryOp;
                operator = "/";
                return;
            }
        }
        if (isAlpha(ch) || ch == "_") {
            var s = "";
            do {
                s = s + ch;
                nextChar();
            } while (isAlnum(ch) || ch == "_");
            var i = keywordStart;
            while (i <= keywordEnd) {
                if (keyword[i] == s) {
                    symKind = i;
                    if (symKind == symBoolean)
                        symKind = symNumber;
                    return;
                }
                i = i + 1;
            }
            ident = s;
            symKind = symIdent;
            return;
        }
        if (isDigit(ch)) {
            var digit = "";
            do {
                digit = digit + ch;
                nextChar();
            } while (isDigit(ch));
            if (digit == "0" && tolower(ch) == "x") {
                do {
                    digit = digit + ch;
                    nextChar();
                } while (isHex(ch));
            }
            digitValue = digit; // 文字列に変更   val(digit);
            symKind = symDigit;
            return;
        }
        if (ch == '\"' || ch == "'") {
            var terminator = ch;
            var stringLiteral = "";
            nextChar();
            while (ch != terminator) {
                if (ch == '"' || ch == "'")
                    stringLiteral = stringLiteral + "\\";
                stringLiteral = stringLiteral + ch;
                if (ch == escapeChar) {
                    nextChar();
                    stringLiteral = stringLiteral + ch;
                }
                nextChar();
                if (wcslen(ch) == 0) {
                    syntaxError("文字列リテラルが閉じられていません");
                }
            }
            nextChar();
            stringValue = stringLiteral;
            symKind = symStringLiteral;
            return;
        }
        if (ch == ',') {
            symKind = symComma;
            nextChar();
            return;
        }
        if (ch == ';') {
            symKind = symSemicolon;
            nextChar();
            return;
        }
        if (ch == ':') {
            symKind = symColon;
            nextChar();
            return;
        }
        if (ch == '=') {
            nextChar();
            if (ch == '=') {
                symKind = symBinaryOp;
                operator = "==";
                nextChar();
            }
            else if (ch == '>') {
                symKind = symLambdaOp;
                nextChar();
            }
            else
                symKind = symAssignment;
            return;
        }
        if (ch == '&') {
            nextChar();
            if (ch == '&') {
                symKind = symBinaryOp;
                operator = "&&";
                nextChar();
            }
            else {
                symKind = symBinaryOp;
                operator = "&";
            }
            return;
        }
        if (ch == '|') {
            nextChar();
            if (ch == '|') {
                symKind = symBinaryOp;
                operator = "||";
                nextChar();
            }
            else {
                symKind = symBinaryOp;
                operator = "|";
            }
            return;
        }
        if (ch == '~') {
            symKind = symUnaryOp;
            operator = '~';
            nextChar();
            return;
        }
        if (ch == '!') {
            ch = nextChar();
            if (ch == '=') {
                symKind = symBinaryOp;
                operator = "!=";
                nextChar();
            }
            else {
                symKind = symUnaryOp;
                operator = '!';
            }
            return;
        }
        if (ch == '>') {
            symKind = symBinaryOp;
            ch = nextChar();
            if (ch == '=') {
                operator = ">=";
                nextChar();
            }
            else
                operator = ">";
            return;
        }
        if (ch == '<') {
            symKind = symBinaryOp;
            ch = nextChar();
            if (ch == '=') {
                operator = "<=";
                nextChar();
            }
            else {
                operator = "<";
            }
            return;
        }
        if (ch == '*' || ch == '%' || ch == '^') {
            symKind = symBinaryOp;
            operator = ch;
            nextChar();
            return;
        }
        if (ch == '+' || ch == '-') {
            symKind = symAddOp;
            operator = ch;
            nextChar();
            return;
        }
        if (ch == '(') {
            symKind = symLParen;
            nextChar();
            return;
        }
        if (ch == ')') {
            symKind = symRParen;
            nextChar();
            return;
        }
        if (ch == '{') {
            symKind = symLCurlyBrace;
            nextChar();
            return;
        }
        if (ch == '}') {
            symKind = symRCurlyBrace;
            nextChar();
            return;
        }
        if (ch == '[') {
            symKind = symLBracket;
            nextChar();
            return;
        }
        if (ch == ']') {
            symKind = symRBracket;
            nextChar();
            return;
        }
        syntaxError("意図しない文字があります");
        return;
    }
}
function initCompiler(text) {
    srcText = text;
    nextChar();
    nextSym();
}
function checkSym(sym, symStr) {
    if (symKind == sym) {
        nextSym();
        return;
    }
    syntaxError(symStr + 'が必要です');
}
function dumpIdents() {
    insert("// --------------------\n");
    var i = 0;
    while (i < nIdents) {
        insert("// " + identsName[i] + ":" + identsType[i] + ":" + str(identsLevel[i]) + "\n");
        i = i + 1;
    }
    insert("// --------------------\n");
}
var tempCode = "";
var nTempVars = 0;
var nTempLable = 0;
var currentBreakLabel = -1;
var currentContinueLabel = -1;
function genTempCode() {
    if (tempCode > "") {
        insert(tempCode + "\r\n");
        tempCode = "";
    }
    nTempVars = 0;
}
function genCode(code) {
    genTempCode();
    if (code != "")
        insert(code + "\r\n");
}
function genReturnVar(type) {
    if (type == "s")
        return "$$return";
    else if (type == "n")
        return "##return";
    else
        syntaxError("数値型または文字型の式が必要です（コンパイラのバグ）");
}
function pushTempCode(code) {
    tempCode = tempCode + code;
}
function popTempCode() {
    var code = tempCode;
    tempCode = "";
    return code;
}
// 以下はexpressionとstatementの前方宣言
var expression;
var statement;
function getCodePriority(code) {
    return wcsmidstr(code, 0, 1);
}
function getCodeType(code) {
    return wcsmidstr(code, 1, 1);
}
function getCodeLR(code) {
    return wcsmidstr(code, 2, 1);
}
function getCodeBody(code) {
    return wcsmidstr(code, 3);
}
function genVar(pos) {
    var varType = wcsmidstr(identsType[pos], 0, 1);
    var typeChar = varType;
    var varPrefix = "$";
    var array = 0;
    if (typeChar == "s" || typeChar == "x") {
        // 何もしない
    }
    else if (typeChar == "n") {
        varPrefix = "#";
    }
    else if (typeChar == "S") {
        array = 1;
        typeChar = "s";
    }
    else if (typeChar == "N") {
        array = 1;
        typeChar = "n";
        varPrefix = "#";
    }
    else {
        syntaxError("不正な型情報（コンパイラのバグ）");
    }
    var code;
    if (identsLevel[pos] == 0) {
        code = "0" + typeChar + "L" + varPrefix + identsName[pos];
    }
    else if (identsLevel[pos] < 0) {
        code = "0" + typeChar + "L" + varPrefix + varPrefix + str(-identsLevel[pos]);
    }
    else {
        code = "0" + typeChar + "L" + varPrefix + varPrefix + identsName[pos];
    }
    if (array) {
        if (symKind != symLBracket)
            syntaxError("[が必要です");
        while (symKind == symLBracket) {
            nextSym();
            var code2 = expression();
            if (getCodeType(code2) != "n")
                syntaxError("数値型の式が必要です(1)");
            code = code + "[" + getCodeBody(code2) + "]";
            checkSym(symRBracket, "]");
        }
    }
    return code;
}
function getTempLabels(n) {
    var L = nTempLable;
    nTempLable = nTempLable + n;
    return L;
}
function validLabel(n) {
    return n >= 0;
}
// 関数呼び出し用の一時変数を生成する。右辺値
//
function genTempVar(type) {
    var varname = "_" + str(nTempVars);
    nTempVars = nTempVars + 1;
    if (type == "s") {
        if (currentLevel == 0) {
            return "0sR$" + varname;
        }
        else {
            return "0sR$$" + varname;
        }
    }
    else if (type == "n") {
        if (currentLevel == 0) {
            return "0nR#" + varname;
        }
        else {
            return "0nR##" + varname;
        }
    }
    else {
        syntaxError("あり得ない一時変数の型（コンパイラのバグ）");
    }
}
function genParameterCode(paramTypes) {
    var paramCode = "";
    if (symKind != symRParen) {
        while (1) {
            var paramType = wcsmidstr(paramTypes, 0, 1);
            if (paramType == "!")
                return paramCode;
            if (paramType == "")
                syntaxError("パラメータが多すぎます");
            var codeParam = expression();
            var codeType = getCodeType(codeParam); // パラメータコードの型を取り出し
            if (tolower(paramType) != codeType)
                syntaxError("パラメータの型が違います");
            paramCode = paramCode + " " + getCodeBody(codeParam);
            paramTypes = wcsmidstr(paramTypes, 1);
            if (symKind != symComma)
                break;
            paramCode = paramCode + ",";
            nextSym();
        }
    }
    var firstParam = wcsmidstr(paramTypes, 0, 1);
    if (paramTypes > "" && (firstParam == "n" || firstParam == "s"))
        syntaxError("パラメータが足りません");
    return paramCode;
}
function functionCall(pos, type, mode) {
    var funcType = wcsmidstr(identsType[pos], 1, 1);
    var code = "call " + identsName[pos] + " ";
    checkSym(symLParen, '(');
    code = code + genParameterCode(wcsmidstr(identsType[pos], 2));
    checkSym(symRParen, ')');
    pushTempCode(code + ";");
    if (mode) {
        if (funcType == "v")
            syntaxError("void型の関数の値は使えません");
        var tempVar = genTempVar(funcType);
        pushTempCode(getCodeBody(tempVar) + "=" + genReturnVar(funcType) + ";");
        return tempVar;
    }
    else {
        return "0vR"; // 値を受け取らない関数呼び出し
    }
}
function builtinPrintln() {
    checkSym(symLParen, '(');
    var code = expression();
    checkSym(symRParen, ')');
    var type1 = getCodeType(code);
    if (type1 == "n") {
        return "0vRinsert str(" + getCodeBody(code) + ')+\"\\n\"';
    }
    else if (type1 == "s") {
        return "0vRinsert " + getCodeBody(code) + '+\"\\n\"';
    }
    else {
        syntaxError("builtinPrintlnで予期しない型（コンパイラのバグ?）");
    }
}
function builtinSearch(funcName, pos) {
    // var options: string[] = new Array();
    // var nOptions = 0;
    checkSym(symLParen, '(');
    var paramCode = genParameterCode(wcsmidstr(identsType[pos], 2));
    // var keyword = expression();
    if (symKind == symIdent) {
        while (1) {
            // nextSym();
            checkSym(symIdent, "識別子");
            if (ident == "word" || ident == "casesense " || ident == "nocasesense"
                || ident == "regular" || ident == "noregular" || ident == "fuzzy" || ident == "inselect"
                || ident == "linknext" || ident == "hilight" || ident == "nohilight" || ident == "incolormarker") {
                // options[nOptions] = ident;
                // nOptions = nOptions + 1;
                paramCode = paramCode + ident;
            }
            else
                syntaxError("不適切な検索オプション(" + ident + ")");
            var dummy = ident;
            if (symKind != symComma)
                break;
            paramCode = paramCode + ",";
            nextSym();
        }
    }
    checkSym(symRParen, ')');
    // if (getCodeType(keyword) != "s")
    //    syntaxError("検索キーワードは文字列型が必要です");
    var code = "0vR" + funcName + " " + paramCode;
    /**    var code: string;
        if (nOptions > 0) {
            var n = 0;
            while (n < nOptions) {
                code = code + ", " + options[n];
                n = n + 1;
            }
        }
    **/
    return code;
}
function builtinFunction(pos, mode) {
    var funcName = identsName[pos];
    if (funcName == "insertln")
        return builtinPrintln();
    if (funcName == "searchdown" || funcName == "grep" || funcName == "replaceall")
        return builtinSearch(funcName, pos);
    if (wcsleftstr(funcName, 1) == "_") {
        funcName = wcsmidstr(funcName, 1);
    }
    var code;
    var funcType = wcsmidstr(identsType[pos], 1, 1);
    if (funcType == "v") {
        if (mode)
            syntaxError("秀丸の「文」を関数として呼び出しました");
        code = funcName + " ";
    }
    else if (wcslen(identsType[pos]) == 2)
        code = funcName;
    else
        code = funcName + "("; // 通常の組み込み関数関数
    checkSym(symLParen, '(');
    code = code + genParameterCode(wcsmidstr(identsType[pos], 2));
    if (funcType != "v" && wcslen(identsType[pos]) != 2)
        code = code + ")";
    checkSym(symRParen, ')');
    return "0" + funcType + "R" + code;
}
function variableOrFunctionCall(mode) {
    var pos = searchIdent(ident);
    if (pos < 0) {
        syntaxError(ident + "が見つかりません");
    }
    nextSym();
    var type = wcsmidstr(identsType[pos], 0, 1);
    if (type == "s" || type == "S" || type == "n" || type == "N" || (type == "x" && symKind != symLParen)) {
        return genVar(pos);
    }
    else if (type == "f" || type == "x") {
        return functionCall(pos, type, mode);
    }
    else if (type == "F") {
        return builtinFunction(pos, mode);
    }
    else {
        syntaxError("不正な識別子です（コンパイラのバグ?）");
    }
}
function factor(mode) {
    if (symKind == symLParen) {
        nextSym();
        var code = expression();
        checkSym(symRParen, ")");
        return getCodePriority(code) + getCodeType(code) + "R" + getCodeBody(code);
    }
    else if (symKind == symIdent) {
        return variableOrFunctionCall(mode);
    }
    else if (symKind == symDigit) {
        var dValue = digitValue;
        nextSym();
        return "0nR" + dValue; // str() を削除
    }
    else if (symKind == symStringLiteral) {
        var sValue = stringValue;
        nextSym();
        return '0sR\"' + sValue + '\"';
    }
    else {
        syntaxError("識別子か数値が必要です");
    }
}
function unaryExpression() {
    var ops = "";
    var firstPriority = "";
    var lastPriority = "9";
    var nParens = 0;
    while (symKind == symAddOp || symKind == symUnaryOp) {
        var uopPriority = "2";
        if (operator == '!') {
            uopPriority = "5";
        }
        else if (operator == '~') {
            operator = "(-1) ^ ";
            uopPriority = "5";
        }
        if (uopPriority > lastPriority) {
            ops = ops + "(" + operator;
            nParens = nParens + 1;
        }
        else {
            ops = ops + operator;
        }
        nextSym();
        lastPriority = uopPriority;
        if (firstPriority == "")
            firstPriority = uopPriority;
    }
    var code = factor(1); // 引数の 1 は右辺値であることを示す
    var priority = getCodePriority(code);
    var type1 = getCodeType(code);
    var LRvalue = getCodeLR(code);
    code = getCodeBody(code);
    if (ops != "" && type1 != "n")
        syntaxError("数値型が必要です(1)");
    if (ops != "" && priority > "1")
        code = ops + "(" + code + ")";
    else
        code = ops + code;
    while (nParens > 0) {
        code = code + ")";
        nParens = nParens - 1;
    }
    if (firstPriority != "")
        priority = firstPriority;
    return priority + type1 + LRvalue + code;
}
function getOpPriority(op) {
    var p = 0;
    while (p <= opEnd) {
        if (operators[p] == op)
            return opPriority[p];
        p = p + 1;
    }
    syntaxError("演算子の優先順位が見つかりません（コンパイラのバグ?）");
}
function getHidePriority(op) {
    var p = 0;
    while (p <= opEnd) {
        if (operators[p] == op)
            return hidePriority[p];
        p = p + 1;
    }
    syntaxError("演算子の秀丸マクロ上の優先順位が見つかりません（コンパイラのバグ?）");
}
function checkBinOpType(op, type1, type2) {
    var etype = type1;
    if (op == "+") {
        if (type1 != type2)
            syntaxError("文字列と数値の足し算はできません");
    }
    else if (op == "==" || op == "!=" || op == ">" || op == ">=" || op == "<" || op == "<=") {
        if (type1 != type2)
            syntaxError("文字列と数値の比較はできません");
        etype = "n";
    }
    else {
        if (type1 != "n" || type2 != "n")
            syntaxError("数値型が必要です(2)");
        etype = "n";
    }
    return etype;
}
function genBianryOp(code1, op, code2) {
    var bopPriority = getHidePriority(op);
    var priority1 = getCodePriority(code1);
    var type1 = getCodeType(code1);
    code1 = getCodeBody(code1);
    var priority2 = getCodePriority(code2);
    var type2 = getCodeType(code2);
    code2 = getCodeBody(code2);
    var etype = checkBinOpType(op, type1, type2);
    if (priority1 > bopPriority || ((priority1 == "4") && (bopPriority == "4")))
        code1 = "(" + code1 + ")";
    if (priority2 >= bopPriority)
        code2 = "(" + code2 + ")";
    return bopPriority + etype + "R" + code1 + op + code2;
}
expression = function () {
    var code = unaryExpression();
    var stack = new Array(); // 演算子順位法のスタック
    var sp = 0; // 同スタックポインタ
    stack[sp] = code;
    sp = sp + 1; // push
    while (symKind == symBinaryOp || symKind == symAddOp) {
        var op = operator;
        nextSym();
        if (sp >= 3) {
            var op1 = stack[sp - 2];
            var op1pri = getOpPriority(op1);
            var op2pri = getOpPriority(op);
            if (op1pri <= op2pri) {
                stack[sp - 3] = genBianryOp(stack[sp - 3], op1, stack[sp - 1]); // 演算結果をスタックに
                sp = sp - 2;
            }
        }
        stack[sp] = op;
        sp = sp + 1; // push(op); … shift処理
        var code2 = unaryExpression();
        stack[sp] = code2;
        sp = sp + 1; // push(code2);
    }
    var n = 0;
    while (sp >= 3) {
        stack[sp - 3] = genBianryOp(stack[sp - 3], stack[sp - 2], stack[sp - 1]);
        sp = sp - 2;
    }
    return stack[0];
};
function parameter(n, needRegister) {
    var paramName = ident;
    var type = "";
    checkSym(symIdent, "識別子(1)");
    checkSym(symColon, ":");
    if (symKind == symNumber) {
        type = "n";
    }
    else if (symKind == symString) {
        type = "s";
    }
    else {
        syntaxError("型名が必要です(1)");
    }
    if (needRegister)
        register(paramName, type, -n);
    nextSym();
    return type;
}
function parameterList(needRegister) {
    var n = 1;
    var paramTypes = "";
    while (1) {
        paramTypes = paramTypes + parameter(n, needRegister);
        if (symKind != symComma)
            break;
        nextSym();
        n = n + 1;
    }
    return paramTypes;
}
function statementList(endSym) {
    while (symKind != endSym) {
        statement();
    }
}
function defFunction(funcName) {
    var funcPos = 0;
    var funcType = "fv"; // デフォルトの関数タイプは fv
    var funcTypeFw = "";
    var saveCurrentFuncType = currentFuncType; // currentFuncTypeを保存しておく
    currentFuncType = "v"; // 関数の戻り値型を指定しない場合のデフォルトはvoidとする
    if (currentLevel != 0)
        syntaxError('関数のネストはできません');
    if (funcName == "") {
        checkSym(symIdent, "識別子(2)");
        funcName = ident;
        funcPos = register(funcName, funcType, 0);
    }
    else {
        funcPos = searchIdent(funcName);
        funcTypeFw = identsType[funcPos];
    }
    genCode("goto _end_" + funcName);
    genCode(funcName + ":");
    var saveNIdents = nIdents; // 識別子の個数を保存しておく
    checkSym(symLParen, "(");
    var paramTypes = "";
    if (symKind == symIdent) {
        paramTypes = parameterList(1); // パラメータ1は、引数を識別子表に登録する指示
    }
    checkSym(symRParen, ")");
    if (symKind == symColon) {
        nextSym();
        if (symKind == symVoid) {
            // 何もしない
        }
        else if (symKind == symNumber) {
            funcType = "fn";
            currentFuncType = "n";
        }
        else if (symKind == symString) {
            funcType = "fs";
            currentFuncType = "s";
        }
        else {
            syntaxError("型名が必要です(2)");
        }
        nextSym(); // 型名の読み飛ばし
    }
    funcType = funcType + paramTypes;
    if (funcTypeFw != "" && wcsmidstr(funcType, 1) != wcsmidstr(funcTypeFw, 1))
        syntaxError("関数の前方宣言と定義の型が異なっています");
    identsType[funcPos] = funcType; // forwardでない場合
    currentLevel = 1; // レベルをローカル（関数の中）とする
    checkSym(symLCurlyBrace, "{");
    statementList(symRCurlyBrace); // 関数の実体
    checkSym(symRCurlyBrace, "}");
    nIdents = saveNIdents; // 識別子の個数を戻す（ローカル変数をテーブルから削除）
    currentLevel = 0; // レベルをグローバルに戻す
    if (currentFuncType == "v")
        genCode("return;");
    else if (currentFuncType == "n")
        genCode("return 0;");
    else if (currentFuncType == "s")
        genCode('return \"\";');
    else
        syntaxError("ありえない関数の型（コンパイラのバグ）");
    genCode("_end_" + funcName + ":");
    currentFuncType = saveCurrentFuncType; // currentFuncTypeを戻す
}
function assignmentExpression() {
    var code = factor(0); // factor(0)は左辺値か、単純な関数呼び出しであることを示す
    var type1 = getCodeType(code);
    var LRvalue = getCodeLR(code);
    code = getCodeBody(code);
    if (symKind == symAssignment) {
        if (LRvalue == "R")
            syntaxError("代入文の左辺には左辺値が必要です");
        nextSym();
        if (symKind == symFunction) {
            nextSym();
            defFunction(wcsmidstr(code, 1));
        }
        else {
            var code2 = expression();
            if (getCodeType(code2) != type1) {
                syntaxError("文字列と数値の型が異なる代入はできません");
            }
            code = code + "=" + getCodeBody(code2);
            genCode(code + ";");
        }
    }
    else {
        if (LRvalue == "L")
            syntaxError("代入を伴わない式です");
        else if (type1 != "v")
            syntaxError("秀丸の組み込み関数やキーワードをサブルーチンとして呼び出すことはできません");
        else if (code != "")
            code = code + ";";
        genCode(code);
    }
}
function checkType() {
    var typeName;
    if (symKind == symNumber)
        typeName = "n";
    else if (symKind == symString)
        typeName = "s";
    else
        syntaxError("呼び出し側でチェックしているのでこれはあり得ない(1)");
    nextSym();
    if (symKind == symLBracket) {
        nextSym();
        if (typeName == "n")
            typeName = "NL";
        else if (typeName == "s")
            typeName = "SL";
        else
            syntaxError("呼び出し側でチェックしているのでこれはあり得ない(2)");
        checkSym(symRBracket, "]");
        if (symKind == symAssignment) {
            nextSym();
            checkSym(symNew, "new");
            checkSym(symIdent, "Array");
            if (ident != "Array")
                syntaxError("Arrayが必要です");
            checkSym(symLParen, "(");
            checkSym(symRParen, ")");
        }
    }
    else {
        typeName = typeName + "L";
    }
    return typeName;
}
function checkFunction() {
    var paramTypes = "";
    nextSym(); // ( の読み飛ばし
    if (symKind == symIdent) {
        paramTypes = parameterList(0); // 引数 0 は識別子表にパラメータを登録しないという意味
    }
    checkSym(symRParen, ")");
    checkSym(symLambdaOp, "=>");
    var funcType;
    if (symKind == symVoid) {
        funcType = "xv";
    }
    else if (symKind == symNumber) {
        funcType = "xn";
    }
    else if (symKind == symString) {
        funcType = "xs";
    }
    else {
        syntaxError("型名が必要です(3)");
    }
    nextSym(); // 型名の読み飛ばし
    return funcType + paramTypes;
}
function varStatement() {
    checkSym(symIdent, "識別子(3)");
    var varName = ident;
    var typeName;
    if (symKind == symColon) {
        nextSym();
        if (symKind == symNumber || symKind == symString) {
            typeName = checkType();
            register(varName, typeName, currentLevel);
        }
        else if (symKind == symLParen) {
            typeName = checkFunction();
            register(varName, typeName, currentLevel);
        }
        else {
            syntaxError('型名が必要です(4)');
        }
    }
    else if (symKind == symAssignment) {
        nextSym();
        var code1 = expression();
        typeName = getCodeType(code1);
        var pos = register(varName, typeName, currentLevel);
        var code2 = genVar(pos);
        genCode(getCodeBody(code2) + "=" + getCodeBody(code1) + ";");
    }
    else {
        syntaxError('式またはコロンが必要です');
    }
}
function getLabel(n) {
    return "_LL" + str(n);
}
function genLabel(n) {
    genCode(getLabel(n) + ":");
}
function ifStatement() {
    checkSym(symLParen, "(");
    var cmpCode = expression();
    if (getCodeType(cmpCode) != "n")
        syntaxError("数値型の式が必要です(2)");
    checkSym(symRParen, ")");
    genCode("if ( " + getCodeBody(cmpCode) + ") {");
    statement();
    if (symKind == symElse) {
        nextSym();
        genCode("} else {");
        statement();
    }
    genCode("}");
}
function whileStatement() {
    var saveBreakLabel = currentBreakLabel;
    var saveContinueLabel = currentContinueLabel;
    var label = getTempLabels(3);
    currentBreakLabel = label + 2;
    currentContinueLabel = label + 1;
    genCode("goto " + getLabel(currentContinueLabel));
    checkSym(symLParen, "(");
    var cmpCode = expression();
    if (getCodeType(cmpCode) != "n")
        syntaxError("数値型の式が必要です(3)");
    var tempCode1 = popTempCode();
    checkSym(symRParen, ")");
    genLabel(label); // ループの戻り
    statement();
    genLabel(label + 1); // continue用ラベル
    pushTempCode(tempCode1);
    genCode("if (" + getCodeBody(cmpCode) + ") goto " + getLabel(label));
    genLabel(label + 2); // break用ラベル
    currentBreakLabel = saveBreakLabel;
    currentContinueLabel = saveContinueLabel;
}
function doStatement() {
    var saveBreakLabel = currentBreakLabel;
    var saveContinueLabel = currentContinueLabel;
    var label = getTempLabels(3);
    currentBreakLabel = label + 2;
    currentContinueLabel = label + 1;
    genLabel(label); // ループの戻り
    statement();
    genLabel(label + 1); // continue用ラベル
    checkSym(symWhile, "while");
    checkSym(symLParen, "(");
    var cmpCode = expression();
    if (getCodeType(cmpCode) != "n")
        syntaxError("数値型の式が必要です(4)");
    checkSym(symRParen, ")");
    genCode("if (" + getCodeBody(cmpCode) + ") goto " + getLabel(label));
    genLabel(label + 2); // break用ラベル
    currentBreakLabel = saveBreakLabel;
    currentContinueLabel = saveContinueLabel;
}
function returnStatement() {
    if (currentFuncType == "")
        syntaxError("関数定義の外でreturnはできません");
    if (symKind == symSemicolon) {
        if (currentFuncType != "v")
            syntaxError("returnの後に式が必要です");
        genCode("return;");
    }
    else {
        var code = expression();
        if (currentFuncType == "v")
            syntaxError("void型関数なのに値を返そうとしています");
        if (getCodeType(code) != currentFuncType)
            syntaxError("関数定義とreturnの型が違います");
        genCode("return " + getCodeBody(code) + ";");
    }
}
function breakStatement() {
    if (validLabel(currentBreakLabel)) {
        genCode("goto " + getLabel(currentBreakLabel));
    }
    else {
        syntaxError("breakできません");
    }
}
function continueStatement() {
    if (validLabel(currentContinueLabel)) {
        genCode("goto " + getLabel(currentContinueLabel));
    }
    else {
        syntaxError("continueできません");
    }
}
statement = function () {
    if (symKind == symVar) {
        nextSym();
        varStatement();
    }
    else if (symKind == symIdent) {
        assignmentExpression();
    }
    else if (symKind == symFunction) {
        nextSym();
        defFunction("");
    }
    else if (symKind == symIf) {
        nextSym();
        ifStatement();
    }
    else if (symKind == symWhile) {
        nextSym();
        whileStatement();
    }
    else if (symKind == symDo) {
        nextSym();
        doStatement();
    }
    else if (symKind == symReturn) {
        nextSym();
        returnStatement();
    }
    else if (symKind == symBreak) {
        nextSym();
        breakStatement();
    }
    else if (symKind == symContinue) {
        nextSym();
        continueStatement();
    }
    else if (symKind == symLCurlyBrace) {
        nextSym();
        statementList(symRCurlyBrace);
        nextSym();
    }
    else {
        syntaxError("予期しない文です");
    }
    if (symKind == symSemicolon)
        nextSym();
};
var outBuffer = "";
function compile(src) {
    initCompiler(src);
    statementList(symEOF);
    insert('// compileAndExecute::Done\r\n');
    return outBuffer;
}
if (version() > 0) {
    selectall();
    var sx = gettext(seltopx(), seltopy(), selendx(), selendy(), 1);
    var filebase = basename();
    if (filebase == "") {
        message("まずセーブして下さい");
        endmacro();
    }
    var pos = wcsstrrstr(filebase, ".");
    filebase = wcsleftstr(filebase, pos) + ".mac";
    var fname = macrodir() + "\\" + filebase;
    var winno = findhidemaru(fname);
    if (winno == -1) {
        openfile(fname);
    }
    else {
        setactivehidemaru(winno);
    }
    insert("コンパイル中…しばらくお待ち下さい");
    selectall();
    disabledraw();
    _delete();
    var t1 = tickcount();
    compile(sx);
    var t2 = tickcount();
    insert("// t1 : " + str(t1) + "  t2 : " + str(t2) + "  diff = " + str(t2 - t1) + "\n");
    enabledraw();
    save();
}
//EOF  これ以降は TypeScript + Node.js のコードが自由に書ける
var path = require('path');
var fs = require('fs');
var argv = process.argv;
var srcfile = argv[2]; // ソースファイル名
if (!srcfile) {
    console.log('Usage: node hidescript.js source-file');
    process.exit(1);
}
var ext = path.extname(srcfile);
var filename = path.basename(srcfile, ext);
var outfile = path.format({ dir: macrodir(), name: filename, ext: ".mac" }); // 出力ファイルの組み立て
try {
    var src = fs.readFileSync(srcfile, 'utf8');
    var label = 'compile-time';
    console.time(label);
    var out = compile(src);
    console.timeEnd(label);
    // String.fromCharCode(0xFEFF) はBOM
    fs.writeFileSync(outfile, String.fromCharCode(0xFEFF) + out, 'utf8');
}
catch (err) {
    message(err.message);
    process.exit(1);
}
process.exit(0);
function macrodir() {
    var hidemacrodir = process.env.hidemacrodir; // 秀丸マクロのディレクトリを環境変数から受け取る
    if (typeof hidemacrodir === "undefined") {
        hidemacrodir = "."; // 環境変数が未定義の場合はカレントディレクトリに出力する
    }
    return hidemacrodir;
}
function message(msg) {
    // insert(msg + "\n");
    console.log(msg);
}
function wcsmidstr(s, n1, n2) {
    if (n2 === void 0) { n2 = 327670000; }
    return s.substr(n1, n2);
}
function wcsleftstr(s, n1) {
    return s.substr(0, n1);
}
function endmacro() {
    process.exit(1);
}
function str(n) {
    return n.toString();
}
function val(s) {
    return parseInt(s, 10);
}
function tolower(s) {
    return s.toLowerCase();
}
function wcslen(s) {
    return s.length;
}
function insert(s) {
    outBuffer = outBuffer + s;
    // console.log(s.replace(/\r?\n/g, ""));
}
function wcsstrrstr(a, b) {
    return 0;
} // dummy 実装した方がよい
function version() {
    return 0;
}
function gettext(x1, y1, x2, y2, n) {
    if (n === void 0) { n = 0; }
    return "";
} // dummy
function selectall() {
} // dummy
function seltopx() {
    return 0;
} // dummy
function seltopy() {
    return 0;
} // dummy
function selendx() {
    return 0;
} // dummy
function selendy() {
    return 0;
} // dummy
function basename() {
    return "";
} // dummy
function findhidemaru(fname) {
    return 0;
} // dummy
function openfile(fname) {
} // dummy
function setactivehidemaru(winno) {
} // dummy
function _delete() {
} // dummy
function disabledraw() {
} // dummy
function enabledraw() {
} // dummy
function tickcount() {
    return 0;
} // dummy
function save() {
} // dummy
//# sourceMappingURL=hidescript.js.map
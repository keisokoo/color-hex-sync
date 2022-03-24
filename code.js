var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__);
function componentToRGBNumber(c) {
    return Math.round(c * 255);
}
function componentToHex(c) {
    var hex = (componentToRGBNumber(c) | (1 << 8)).toString(16).slice(1);
    return hex.length == 1 ? '0' + hex : hex;
}
function rgbaToHex(r, g, b, a) {
    let hex = '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    let alpha = a ? String(a) : '1';
    alpha =
        alpha === '1'
            ? ''
            : ((Number(alpha) * 255) | (1 << 8)).toString(16).slice(1);
    return hex + alpha;
}
function changeText(name, colorName) {
    return __awaiter(this, void 0, void 0, function* () {
        const test = figma.currentPage.findOne((n) => {
            return n.name === name;
        });
        if (test && test.type === 'TEXT') {
            yield figma.loadFontAsync(test.fontName);
            test.deleteCharacters(0, test.characters.length);
            test.insertCharacters(0, colorName);
        }
    });
}
function colorText(paintItem, name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (paintItem.type === 'SOLID') {
            const hexColor = rgbaToHex(paintItem.color.r, paintItem.color.g, paintItem.color.b, 1);
            const opacityText = typeof paintItem.opacity === 'number' && paintItem.opacity < 1
                ? `, opacity ${(paintItem.opacity * 100).toFixed(0)}`
                : '';
            console.log('opacityText', opacityText);
            return yield changeText(name, hexColor + opacityText);
        }
        else if (paintItem.type === 'IMAGE') {
        }
        else {
            const complexColor = paintItem.gradientStops
                .map((paintItem) => {
                const hexColor = rgbaToHex(paintItem.color.r, paintItem.color.g, paintItem.color.b, paintItem.color.a);
                return hexColor;
            })
                .join(', ');
            return yield changeText(name, complexColor);
        }
    });
}
function promiseSync() {
    return new Promise((res, rej) => {
        const paintStyles = figma.getLocalPaintStyles();
        const allDone = paintStyles.map((paint) => {
            paint.paints.map((paintItem) => __awaiter(this, void 0, void 0, function* () {
                yield colorText(paintItem, paint.name);
            }));
            return true;
        });
        if (allDone) {
            res({});
        }
        else {
            rej('unexpected error');
        }
    });
}
function colorSync() {
    return __awaiter(this, void 0, void 0, function* () {
        yield promiseSync();
    });
}
colorSync();
figma.ui.onmessage = (msg) => {
    figma.closePlugin();
};

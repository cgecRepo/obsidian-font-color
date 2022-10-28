export const FONT_COLOR_STYLES = [
    "none",
    "lowlight",
    "floating",
    "rounded",
    "realistic",
];

export const FONT_COLOR_METHODS = ["css-classes", "inline-styles"];

export interface FontColors {
    [color: string]: string;
}

export interface FontColorSettings {
    fontColorStyle: string;
    fontColorMethods: string;
    fontColors: FontColors;
    fontColorOrder: string[];
}

const DEFAULT_SETTINGS: FontColorSettings = {
    fontColorStyle: "none",
    fontColorMethods: "inline-styles",
    fontColors: {
        Pink: "#FFB8EBA6",
        Red: "#FF5582A6",
        Orange: "#FFB86CA6",
        Yellow: "#FFF3A3A6",
        Green: "#BBFABBA6",
        Cyan: "#ABF7F7A6",
        Blue: "#ADCCFFA6",
        Purple: "#D2B3FFA6",
        Grey: "#CACFD9A6",
    },
    fontColorOrder: []
};

DEFAULT_SETTINGS.fontColorOrder = Object.keys(DEFAULT_SETTINGS.fontColors);

export default DEFAULT_SETTINGS;
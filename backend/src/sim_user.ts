export function moodToString(mood : Number) : string {
    switch (mood) {
        case 0:
            return "morbidlyjoyous";
        case 1:
            return "robotic";
        case 2:
            return "absolutelyfantastic";
        case 3:
            return "human";
        case 4:
            return "chipper";
        case 5:
            return "overthemoon";
        case 6:
            return "shocked";
        case 7:
            return "lazy";
        case 8:
            return "sleepy";
        default: // 0-9, so 9 will be routed here.
            return "grateful";
    }
}

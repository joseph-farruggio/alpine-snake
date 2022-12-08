export function roundToNearestTen(num) {
    return Math.ceil(num / 10) * 10;
}

export function getRandomNumber() {
    return Math.floor(Math.random() * (280 - 20 + 1) + 20);
}
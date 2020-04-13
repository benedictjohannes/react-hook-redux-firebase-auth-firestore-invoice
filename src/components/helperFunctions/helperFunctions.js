export const rpDisplay = (inputNumber) =>
    Intl.NumberFormat('ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0}).format(inputNumber);
export const intDisplay = (inputNumber) => Intl.NumberFormat('ID').format(inputNumber);
export const extractNumber = (inputText) => Number(inputText.replace(/\D/g, ''));
export const dateToYyyyMmDd = date =>
    new Date(date)
        .toISOString()
        .slice(0, 10)
        .split('-')
        .reverse()
        .join('/');
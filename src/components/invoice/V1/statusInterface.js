export const statusMap = {
    "1": "Draft",
    "2": "Unpaid",
    "3": "Cancelled",
    "4": "Paid",
}

export const availableStatus = {
    "1": ["2","3","4"],
    "2": ["3","4"],
    "3": [],
    "4": [],
}
export const availableStatusTo = {
    "1": [],
    "2": ["4"],
    "3": [],
    "4": [],
}
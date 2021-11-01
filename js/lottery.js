var metamaskAddress;
var sendInfo = {};
var w3;

function hex_to_ascii(str1) {
    var hex  = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

let detectMetamask = async function() {
    if (typeof window.ethereum === 'undefined') {
        return false;
    }
    w3 = new Web3(web3.currentProvider);
    return true;
}

let enableMetamask = async function() {
    return ethereum.request({ method: 'eth_requestAccounts' }).then(function() {
        metamaskAddress = ethereum.selectedAddress;
        sendInfo = {from: metamaskAddress, value: 0, gas: 250000, gasPrice: 1050000000};
        return ethereum.selectedAddress;
    });
}

var contractABI;
const loadContract = function() {
    contractABI = new w3.eth.Contract([
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_ticketPrice",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "_dev",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "buyTicket",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "close",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getLastPayout",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getLastTicketsSold",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getPayout",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getStatus",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTicketPrice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getWinners",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "open",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_ticketPrice",
                    "type": "uint256"
                }
            ],
            "name": "setTicketPrice",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "soldTickets",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "viewTickets",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ], '0x9aaae62ef379BB8c46CDD2B624D2f6cBeE789978');
};

$(document).ready(function() {
    $('.loading').show();
    $('div.tickets-bought').hide();
    $('.last-game').hide();
    $('div.metamask-not-found').hide();
    $('div.metamask-wrong-network').hide();
    $('.lottery-closed').hide();
    $('.lottery-open').hide();

    ethereum.on('accountsChanged', (accounts) => {
        $('.loading').show();
        window.location.reload();
    });

    ethereum.on('chainChanged', (chainId) => {
        $('.loading').show();
        window.location.reload();
    });

    detectMetamask().then(function(result) {
        if(!result) {
            $('div.metamask-not-found').show();
            return;
        }
        enableMetamask().then(function() {
            ethereum.request({method: 'net_version'}).then(function(netId) {
                if(netId !== '10000') {
                    $('div.row').hide();
                    $('div.metamask-wrong-network').show();
                    return;
                }

                loadContract();

                function refreshSold() {
                    contractABI.methods.soldTickets().call().then(function(sold) {
                        $('span.sold-tickets').html(sold);
                    });
                }

                function loadPayout() {
                    contractABI.methods.getPayout().call().then(function (payout) {
                        $('span.payout').html(Web3.utils.fromWei(payout) + ' BCH');
                    });
                }

                refreshSold();
                contractABI.methods.getStatus().call({})
                .catch(function(e) { alert(e); })
                .then(function(status) {
                    if(status === '0') {
                        $('button.buyticket').prop('disabled', true);
                        $('.lottery-closed').show();
                    } else {
                        $('.lottery-open').show();
                    }
                    contractABI.methods.getTicketPrice().call().then(function(price) {
                        var ticketPrice = price;
                        $('span.ticket-price').html(Web3.utils.fromWei(ticketPrice) + ' BCH');
                        $('button.buyticket').bind('click', function() {
                            $('.loading').show();
                            var am = $('input.ticket-amount').val();
                            contractABI.methods.buyTicket(am).send({from: metamaskAddress, value: (ticketPrice * am), gasPrice: 1050000000}).then(function() {
                                $('div.tickets-bought').show();
                                refreshSold();
                                loadPayout();
                                $('.loading').hide();
                            });
                        });
                        loadPayout();
                        contractABI.methods.getLastTicketsSold().call().then(function(ticketsSold) {
                            $('span.ticketsSold').html(ticketsSold);
                        });
                        contractABI.methods.getLastPayout().call().then(function(payout) {
                            $('span.lastPayout').html(Web3.utils.fromWei(payout) + ' BCH');
                        });
                        contractABI.methods.getWinners().call().then(function(winners) {
                            if(winners.length == 0) {
                                return;
                            }
                            $('.last-game').show();
                            $('span.winner1').html(winners[0]);
                            $('span.winner2').html(winners[1]);
                            $('span.winner3').html(winners[2]);
                        });
                        $('.loading').hide();
                        contractABI.methods.owner().call().then(function(owner) {
                            if(owner.toLowerCase() === metamaskAddress.toLowerCase()) {
                                $('.admin-screen').show();

                                $('button.change-status-open').hide();
                                $('button.change-status-close').hide();
                                $('div.change-price').hide();
                                if(status === '0') {
                                    $('span.current-status').html('Closed!');
                                    $('button.change-status-open').show();
                                    $('div.change-price').show();
                                } else if(status === '1') {
                                    $('span.current-status').html('Open');
                                    $('button.change-status-close').show();
                                }

                                $('button.change-status-open').bind('click', function () {
                                    $('.loading').show();
                                    contractABI.methods.open().send({from: metamaskAddress, value: 0, gasPrice: 1050000000}).then(function() {
                                        window.location = window.location;
                                    });
                                });

                                $('button.change-status-close').bind('click', function () {
                                    $('.loading').show();
                                    contractABI.methods.close().send({from: metamaskAddress, value: 0, gasPrice: 1050000000}).then(function() {
                                        window.location = window.location;
                                    });
                                });

                                $('input.ticket-price').val(Web3.utils.fromWei(ticketPrice));
                                $('button.change-ticket-price').bind('click', function() {
                                    $('.loading').show();
                                    var newPrice = Web3.utils.toWei($('input.ticket-price').val());
                                    contractABI.methods.setTicketPrice(newPrice).send({from: metamaskAddress, value: 0, gas: 250000, gasPrice: 1050000000}).then(function() {
                                        window.location = window.location;
                                    });
                                })
                            }
                        });
                    });
                });
            });
        });
    });
});
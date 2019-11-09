const { errors: rpcErrors } = require("eth-json-rpc-errors");

wallet.updatePluginState({
  accomulatedGas: 30000,
  ids: []
});

wallet.onMetaMaskEvent("tx:status-update", (id, status) => {
  if (status === "confirmed") {
    const currentPluginState = wallet.getPluginState();
    const txMeta = wallet.getTxById(id);

    if (!currentPluginState.ids.includes(id)) {
      const accomulatedGas =
        parseInt(currentPluginState.accomulatedGas) +
        parseInt(txMeta.estimatedGas);
      const ids = currentPluginState.ids.push(id);

      wallet.updatePluginState({
        ...currentPluginState,
        accomulatedGas,
        ids
      });
    }
  }
});

async function sendFunds(to, amount, amountToReduce) {
  const selectedAddress = (await wallet.send({ method: "eth_accounts" }))
    .result[0];

  await wallet.send({
    method: "eth_sendTransaction",
    params: [
      {
        to,
        gasLimi: (21000).toString(16),
        value: amount.toString(16),
        from: selectedAddress
      }
    ],
    from: selectedAddress // Provide the user's account to use.
  });
  const currentPluginState = wallet.getPluginState();
  const accomulatedGas =
    parseInt(currentPluginState.accomulatedGas) - parseInt(amountToReduce);
  wallet.updatePluginState({
    ...currentPluginState,
    accomulatedGas
  });
}

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {
    case "isPluginConnected":
      return true;
    case "getAccumulatedGas":
      return wallet.getPluginState().accomulatedGas;
    case "sendFunds":
      return sendFunds(
        requestObject.params[0],
        requestObject.params[1],
        requestObject.params[2]
      );
    default:
      throw rpcErrors.eth.methodNotFound(requestObject);
  }
});

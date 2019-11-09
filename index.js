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

async function reduceAccumulatedGas(amount) {
  const currentPluginState = wallet.getPluginState();
  const accomulatedGas =
    parseInt(currentPluginState.accomulatedGas) - parseInt(amount);

  wallet.updatePluginState({
    ...currentPluginState,
    accomulatedGas
  });
  return wallet.getPluginState().accomulatedGas;
}

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {
    case "isPluginConnected":
      return true;
    case "getAccumulatedGas":
      return wallet.getPluginState().accomulatedGas;
    case "reduceAccumulatedGas":
      return reduceAccumulatedGas(requestObject.params[0]);
    default:
      throw rpcErrors.eth.methodNotFound(requestObject);
  }
});

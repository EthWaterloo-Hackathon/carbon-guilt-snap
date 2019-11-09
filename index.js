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

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {
    case "isPluginConnected":
      return true;
    case "getAccumulatedGas":
      return wallet.getPluginState().accomulatedGas;
    case "reduceAccumulatedGas":
      const currentPluginState = wallet.getPluginState();
      const accomulatedGas =
        parseInt(currentPluginState.accomulatedGas) -
        parseInt(requestObject[0]);

      wallet.updatePluginState({
        ...currentPluginState,
        accomulatedGas
      });
      return wallet.getPluginState().accomulatedGas;
    default:
      throw rpcErrors.eth.methodNotFound(requestObject);
  }
});

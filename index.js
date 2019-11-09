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

function tokenAddress() {
  return;
}

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
    case "addToken":
      await wallet.addToken(
        "0xd6E105778Aa74aC4CB5D6241a0D161e03d7a2dE7",
        "GIFT",
        18
      );
      return true;
    case "getAccumulatedGas":
      return wallet.getPluginState().accomulatedGas;
    case "reduceAccumulatedGas":
      return reduceAccumulatedGas(requestObject.params[0]);
    default:
      throw rpcErrors.eth.methodNotFound(requestObject);
  }
});

const { errors: rpcErrors } = require("eth-json-rpc-errors");

wallet.updatePluginState({
  accomulatedGas: 0,
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

async function sendFunds(to, amount) {
  const selectedAddress = (await wallet.send({ method: "eth_accounts" }))
    .result[0];
  return wallet.send(
    {
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
    },
    function(err, result) {
      // A typical node-style, error-first callback.
      // The result varies by method, per the JSON RPC API.
      // For example, this method will return a transaction hash on success.
    }
  );
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
        wallet.getPluginState().accomulatedGas
      );
    default:
      throw rpcErrors.eth.methodNotFound(requestObject);
  }
});

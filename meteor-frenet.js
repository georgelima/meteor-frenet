const FRENET_QUOTE_URL = 'http://api.frenet.com.br/shipping/quote'
const FRENET_INFO_URL = 'http://api.frenet.com.br/shipping/info'
const Future = Npm.require('fibers/future')
const request = Npm.require('request')

const _getHeaders = token => ({
  'Content-Type': 'application/json',
  token,
})

function getShippingCompaniesInfo(token) {
  const future = new Future()
  request({
    url: FRENET_INFO_URL,
    headers: _getHeaders(token),
  }, (error, response, body) => {
    if (error) {
      future.throw(error)
    } else {
      future.return(JSON.parse(body))
    }
  })

  return future.wait()
}

function getDeliveryCost(token, data) {
  check(data, {
    SellerCEP: Match.OneOf(String, Number),
    RecipientCEP: Match.OneOf(String, Number),
    ShipmentInvoiceValue: Number,
    ShippingItemArray: Match.Optional(Array),
  })

  const future = new Future()
  const body = JSON.stringify(data)

  request({
    url: FRENET_QUOTE_URL,
    headers: _getHeaders(token),
    method: 'POST',
    body,
  }, (error, response, body) => {
    if (error) {
      future.throw(error)
    } else {
      future.return(JSON.parse(body))
    }
  })

  return future.wait()
}

function getCostByCarrier(token, data) {
  check(data, {
    SellerCEP: Match.OneOf(String, Number),
    RecipientCEP: Match.OneOf(String, Number),
    Carrier: Match.OneOf(String, Number),
    ServiceCode: Match.OneOf(String, Number),
    TotalValue: Number,
    ItemsInfo: Array,
  })

  const carriers = _.get(
    Frenet.getDeliveryCost({
      SellerCEP: data.SellerCEP,
      RecipientCEP: data.RecipientCEP,
      ShipmentInvoiceValue: data.TotalValue,
      ShippingItemArray: data.ItemsInfo,
    }),
    'ShippingSevicesArray',
    [],
  )

  const carrier = _.find(carriers, current =>
    current.Carrier === data.Carrier &&
    current.ServiceCode === data.ServiceCode,
  )

  if (_.isUndefined(carrier)) throw new Meteor.Error('[Frenet] getCostByCarrier', 'Undefined carrier!')

  return carrier.ShippingPrice * 100
}

export default function(token) {
  console.log(`[Frenet] Initialized with this token: ${token}`)
  return {
    getShippingCompaniesInfo: getShippingCompaniesInfo.bind(null, token),
    getDeliveryCost: getDeliveryCost.bind(null, token),
    getCostByCarrier: getCostByCarrier.bind(null, token),
  }
}

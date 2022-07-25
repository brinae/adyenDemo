import logging
import sqlite3, hashlib, os
import Adyen
import json
import uuid
from main.config import get_adyen_api_key, get_adyen_merchant_account


'''
Create Payment Session by calling /sessions endpoint

Request must provide few mandatory attributes (amount, currency, returnUrl, transaction reference)

Your backend should have a payment state where you can fetch information like amount and shopperReference

Parameters
    ----------
    host_url : string
        URL of the host (i.e. http://localhost:8080): required to define returnUrl parameter
'''
def adyen_sessions(host_url, email, amount, firstName, lastName, houseNumber, street, address2, zipcode, city, state, country, reference, currency, shopperReference):
    adyen = Adyen.Adyen()
    adyen.payment.client.xapikey = get_adyen_api_key()
    adyen.payment.client.platform = "test" # change to live for production
    adyen.payment.client.merchant_account = get_adyen_merchant_account()


    request = {}

    request['amount'] = {"value": amount*100, "currency": currency}
    request['shopperEmail'] = email
    request['reference'] = reference
    request['storePaymentMethod'] = True
    request['shopperInteraction'] = 'Ecommerce'
    request['recurringProcessingModel'] = "cardOnFile"
    # set redirect URL required for some payment methods
    request['returnUrl'] = f"{host_url}/redirect?shopperOrder=myRef"
    request['shopperReference'] = shopperReference
    request['shopperName'] = {
                                "firstName": firstName,
                                "lastName": lastName
                             }
    request['billingAddress'] = {
                                    "city": city, 
                                    "country": country, 
                                    "houseNumberOrName": houseNumber, 
                                    "postalCode": zipcode, 
                                    "street": street
                                }
    
    '''
    FOR KLARNA (ON HOLD) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    request['lineItems'] = [
        {
            "quantity": "1",
            "taxPercentage": "0",
            "description": "amsterdam print",
            "id": "amsterdamPrint",
            "amountIncludingTax": "500",
            "productUrl": "URL_TO_PURCHASED_ITEM",
            "imageUrl": "URL_TO_PICTURE_OF_PURCHASED_ITEM"
        },
        {
            "quantity": "1",
            "taxPercentage": "0",
            "description": "toronto print",
            "id": "torontoPrint",
            "amountIncludingTax": "500",
            "productUrl": "URL_TO_PURCHASED_ITEM",
            "imageUrl": "URL_TO_PICTURE_OF_PURCHASED_ITEM"
        }
    ]
    '''
    request['countryCode'] = country

    result = adyen.checkout.sessions(request)
    print(request['shopperName'])
    formatted_response = json.dumps((json.loads(result.raw_response)))
    print("/sessions response:\n" + formatted_response)

    return formatted_response
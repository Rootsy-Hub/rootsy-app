// Generado desde los Zod de rootsy-api. No editar a mano.
// node lib/chat/writePlannerRequired.mjs

export const CHAT_ROOTSY_PLANNER_REQUIRED_TEXT = `OBLIGATORIOS
Query o body. Sin estos la API responde 400. Los :id del path ya van. PATCH parcial: ningún campo es obligatorio. confirmationTyped lo pone la app; no lo armes.
GET /checks/parties direction
GET /current-accounts/candidates direction
GET /expenses year month
GET /inventory/balance articleId
GET /inventory/ledger kind
GET /menu-catalog/scan q
GET /operations view
GET /operations/accounting view operationId
GET /reports/ledger accountCode
GET /reports/ledger/totals accountCode
GET /reports/totals kind
GET /sale/catalog/articles ids
GET /sale/catalog/scan q
GET /treasury/:treasuryAccountId/children/:childId/pending asOf role
POST /arca-sale-points ptoVta
POST /articles name salePrice iva categoryId isActive discountMode discountValue allowNegativeStock itemKind unitOfMeasure defaultWastePct minStockLevel
POST /cash-registers name cashTreasuryAccountId
POST /cash-registers/:cashRegisterId/sessions openingCash
POST /cash-registers/sessions/:sessionId/movements kind amount
POST /categories name
POST /chat title userIds
POST /chat/:channelId/messages body
POST /checks direction checkNumber bankName amount issueDate dueDate
POST /checks/:checkId/clear clearedAt
POST /checks/:checkId/deposit treasuryAccountId depositedAt
POST /checks/:checkId/reject rejectedAt
POST /clients name isActive currentAccountEnabled
POST /comanda-stations name
POST /current-accounts/apply direction partyId applications
POST /current-accounts/settle direction partyId paidAt paymentKind
POST /dock dockItemIds
POST /expense-categories name kind family
POST /expenses categoryId amount expenseDate year month
POST /expenses/:expenseId/payments amount paidAt
POST /hr/clock pin
POST /hr/clock-station/unlock pin
POST /hr/employees firstName lastName jobTitle documentNumber email phone monthlySalary hiredAt notes
POST /hr/employees/:employeeId/francos day
POST /hr/employees/:employeeId/payments amount paidAt paymentKind treasuryAccountId
POST /hr/invitations employeeId roleId
POST /hr/roles displayName grantKeys
POST /inventory/adjustments articleId quantityDelta note
POST /inventory/locations name
POST /inventory/transfers articleId fromLocationId toLocationId quantity
POST /manufacturing recipeId quantity producedAt
POST /mostrador/orders fulfillmentType estimatedMinutes
POST /price-lists name
POST /printers name isActive sortOrder
POST /promotions name promotionType pricingMode fixedPrice discountMode discountValue buyQuantity benefitQuantity benefitDiscountPct applyBenefitTo autoApply showInMenu isActive validFrom validUntil validTimeStart validTimeEnd scheduleDays slots
POST /purchase-orders checkoutSnapshot subtotal discountTotal total supplierId supplierName supplierTaxId
POST /quotes checkoutSnapshot subtotal discountTotal total clientId customerName customerTaxId
POST /recipe-categories name
POST /recipes name categoryId salePrice iva isActive allowNegativeStock ingredients
POST /service-categories name
POST /services name categoryId defaultPrice billingPeriod paymentTiming dueDaysAfter lateInterestType lateInterestValue discountMode discountValue isActive
POST /suppliers name isActive currentAccountEnabled
POST /treasury name kind sortOrder
POST /treasury/:treasuryAccountId/children kind name
POST /treasury/:treasuryAccountId/pos-acreditations posTreasuryAccountId principalAmount creditedAt
POST /treasury/:treasuryAccountId/reconciliation-marks movementKind movementRefId
POST /treasury/:treasuryAccountId/settlements cardTreasuryAccountId fundingTreasuryAccountId principalAmount settledAt
POST /treasury/:treasuryAccountId/statement lineDate amount direction
POST /treasury/:treasuryAccountId/statement/import csvText
PATCH /categories/layout updates
PATCH /comanda-stations/:comandaStationId name
PATCH /current-accounts/enrollment direction partyId enabled
PATCH /dock dockItemIds
PATCH /hr/members/:memberUserId/role roleId
PATCH /hr/roles/:hrRoleId grantKeys
PATCH /inventory/layers/:layerId/expiry expiresAt
PATCH /inventory/locations/:locationId name
PATCH /mostrador/orders/:orderId/checkout checkout
PATCH /mostrador/orders/:orderId/close mode
PATCH /mostrador/orders/:orderId/status status
PATCH /price-lists/:priceListId name
PATCH /recipe-categories/layout updates
PATCH /treasury/:treasuryAccountId name
PATCH /treasury/:treasuryAccountId/active isActive
PUT /me/approval-code code
DELETE /treasury/:treasuryAccountId/reconciliation-marks movementKind movementRefId`

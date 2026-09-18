param(
  [string]$SourceDirectory = 'C:\Users\18954\Desktop\Term',
  [string]$TargetFile = (Join-Path $PSScriptRoot '..\terms-of-sale.html')
)

$ErrorActionPreference = 'Stop'

$termDocumentMap = [ordered]@{
  1  = 'Scope and Application.doc'
  2  = 'Orders and Acceptance.docx'
  3  = 'Pricing, Taxes and Payment.docx'
  4  = 'Product Specifications and Descriptions.docx'
  5  = 'Technical Selection Assistance.docx'
  6  = 'Customer Responsibilities and Compatibility.docx'
  7  = 'Product Documentation.docx'
  8  = 'Manufacturer Information and Third-Party Data.docx'
  9  = 'Performance Claims and Analytical Results.docx'
  10 = 'Shipping and Delivery.docx'
  11 = 'Inspection, Damage and Shortages.docx'
  12 = 'Returns and Return Authorization.docx'
  13 = 'Limited Product Warranty.docx'
  14 = 'Claims and Technical Investigation.docx'
  15 = 'Exclusive Remedies.docx'
  16 = 'Limitation of Liability.docx'
  17 = 'Laboratory and Analytical Use.docx'
  18 = 'Force Majeure and Governing Law.docx'
}

if (-not (Test-Path -LiteralPath $SourceDirectory -PathType Container)) {
  throw "Terms source directory not found: $SourceDirectory"
}

$termTargetPath = [System.IO.Path]::GetFullPath($TargetFile)
if (-not (Test-Path -LiteralPath $termTargetPath -PathType Leaf)) {
  throw "Terms target file not found: $termTargetPath"
}

foreach ($termSourceName in $termDocumentMap.Values) {
  $termSourcePath = Join-Path $SourceDirectory $termSourceName
  if (-not (Test-Path -LiteralPath $termSourcePath -PathType Leaf)) {
    throw "Required terms document not found: $termSourcePath"
  }
}

function Convert-TermParagraphsToHtml {
  param(
    [Parameter(Mandatory)]$Document,
    [Parameter(Mandatory)][int]$SectionNumber
  )

  $termHtml = [System.Collections.Generic.List[string]]::new()
  $termListOpen = $false

  foreach ($termParagraph in $Document.Paragraphs) {
    $termText = ($termParagraph.Range.Text -replace '[\r\a\v\f]', '').Trim()
    if ([string]::IsNullOrWhiteSpace($termText)) { continue }
    if ($SectionNumber -eq 1 -and $termText -match '^1\.\s+Scope and Application$') { continue }

    $termEncodedText = [System.Net.WebUtility]::HtmlEncode($termText)
    $termIsListItem = [int]$termParagraph.Range.ListFormat.ListType -ne 0

    if ($termIsListItem) {
      if (-not $termListOpen) {
        $termHtml.Add('              <ul class="terms-detail-list">')
        $termListOpen = $true
      }
      $termHtml.Add("                <li>$termEncodedText</li>")
      continue
    }

    if ($termListOpen) {
      $termHtml.Add('              </ul>')
      $termListOpen = $false
    }
    $termHtml.Add("              <p>$termEncodedText</p>")
  }

  if ($termListOpen) { $termHtml.Add('              </ul>') }
  if ($termHtml.Count -eq 0) { throw "No body content found for section $SectionNumber" }
  return $termHtml -join "`r`n"
}

# The Word files are retained as the archival source copy. These narrowly scoped
# website overrides implement the current B2B ordering policy and resolve wording
# that would otherwise be ambiguous in an automated Shopify checkout flow.
function Set-TermWebsitePolicyOverrides {
  param(
    [Parameter(Mandatory)][string]$Html,
    [Parameter(Mandatory)][int]$SectionNumber
  )

  $termOldHtml = $null
  $termNewHtml = $null
  switch ($SectionNumber) {
    1 {
      $termOldHtml = @'
              <p>ChromVale primarily supplies products to laboratories, research organizations, educational institutions, businesses, and other commercial or professional customers. Unless otherwise expressly agreed in writing, products are supplied for laboratory, analytical, research, or other professional use.</p>
'@.TrimEnd("`r", "`n")
      $termNewHtml = @'
              <p><strong>Business-to-Business Sales Only.</strong> ChromVale supplies products only to laboratories, research organizations, educational institutions, government entities, businesses, and other commercial or professional organizations.</p>
              <p>By placing an order, the Customer represents that the products are being purchased solely for business, institutional, laboratory, research, educational, governmental, or other professional purposes and not for personal, family, or household use.</p>
              <p>ChromVale may request information reasonably necessary to verify the Customer’s organization or intended use and may decline or cancel an order that does not meet these requirements. Any payment received for a cancelled order will be refunded.</p>
              <p>Nothing in these Terms excludes or limits any right that cannot lawfully be excluded or limited under applicable law.</p>
'@.TrimEnd("`r", "`n")
    }
    2 {
      $termOldHtml = @'
              <p>Receipt of an order, payment, automated website confirmation, or acknowledgement of an order does not by itself constitute acceptance unless expressly stated otherwise by ChromVale. An order will be considered accepted when ChromVale issues a written order confirmation, confirms the order in writing, or ships the applicable products, whichever occurs first.</p>
'@.TrimEnd("`r", "`n")
      $termNewHtml = @'
              <p>Receipt of an order, payment, or an automated “order received” acknowledgement confirms only that ChromVale has received the order and does not constitute acceptance. An order will be considered accepted only when ChromVale sends an explicit order-acceptance confirmation or ships the applicable products, whichever occurs first.</p>
'@.TrimEnd("`r", "`n")
    }
    10 {
      $termOldHtml = @'
              <p>Risk of loss or damage during transportation will be handled in accordance with the applicable shipping arrangement, carrier terms, and any express terms stated in the order confirmation or quotation. Nothing in this section prevents ChromVale from assisting the Customer with a carrier claim where appropriate.</p>
'@.TrimEnd("`r", "`n")
      $termNewHtml = @'
              <p>Unless otherwise agreed in writing, risk of loss or damage remains with ChromVale until the shipment is delivered to the Customer’s designated delivery address. If the Customer arranges or selects its own carrier, risk passes to the Customer when the shipment is delivered to that carrier. Nothing in this section prevents ChromVale from assisting the Customer with a carrier claim where appropriate.</p>
'@.TrimEnd("`r", "`n")
    }
    12 {
      $termOldHtml = @'
              <p>Unless otherwise stated in writing, eligible standard products may be considered for return within thirty (30) days of delivery provided that the product is unused, unopened, undamaged, in its original packaging, and in resalable condition.</p>
'@.TrimEnd("`r", "`n")
      $termNewHtml = @'
              <p>Return eligibility and any applicable return period are determined for the specific product and order. Unless otherwise confirmed in writing, no universal return period applies. Products considered for return must generally be unused, unopened, undamaged, in their original packaging, and in resalable condition.</p>
'@.TrimEnd("`r", "`n")
    }
  }

  if ($null -eq $termOldHtml) { return $Html }
  if (-not $Html.Contains($termOldHtml)) {
    throw "Expected source wording for website override in section $SectionNumber was not found. Review the Word source and override together."
  }
  return $Html.Replace($termOldHtml, $termNewHtml)
}

$termHtmlSource = [System.IO.File]::ReadAllText($termTargetPath)
$termWord = New-Object -ComObject Word.Application
$termWord.Visible = $false
$termWord.DisplayAlerts = 0
$termWord.AutomationSecurity = 3

try {
  foreach ($termDocumentEntry in $termDocumentMap.GetEnumerator()) {
    $termSectionNumber = [int]$termDocumentEntry.Key
    $termSourcePath = Join-Path $SourceDirectory $termDocumentEntry.Value
    $termDocument = $termWord.Documents.Open($termSourcePath, $false, $true)
    try {
      $termBodyHtml = Convert-TermParagraphsToHtml -Document $termDocument -SectionNumber $termSectionNumber
      $termBodyHtml = Set-TermWebsitePolicyOverrides -Html $termBodyHtml -SectionNumber $termSectionNumber
    } finally {
      $termDocument.Close($false)
      [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($termDocument) | Out-Null
    }

    $termPanelPattern = [regex]::new(
      '(?s)(<div class="terms-panel" id="terms-panel-' + $termSectionNumber + '"[^>]*><div class="terms-panel-inner">).*?(</div></div>)'
    )
    $termMatchCount = $termPanelPattern.Matches($termHtmlSource).Count
    if ($termMatchCount -ne 1) {
      throw "Expected one target panel for section $termSectionNumber; found $termMatchCount"
    }
    $termHtmlSource = $termPanelPattern.Replace(
      $termHtmlSource,
      ('$1' + "`r`n" + $termBodyHtml + "`r`n            " + '$2'),
      1
    )
  }
} finally {
  $termWord.Quit()
  [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($termWord) | Out-Null
}

$termEncoding = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($termTargetPath, $termHtmlSource, $termEncoding)
Write-Output "Imported $($termDocumentMap.Count) Terms of Sale documents into $termTargetPath"

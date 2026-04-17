import PDFDocument from "pdfkit/js/pdfkit.standalone"
import blobStream from "blob-stream"
import { Buffer } from "buffer"
import logoAppUrl from "../assets/pdf/logoAppbgwhite.png"
import nameAppUrl from "../assets/pdf/nameAppbgwhite.png"
import scanTitleUrl from "../assets/pdf/scanReportTitle.png"

type PdfReportOptions = {
  fileName: string
}

const compareByIpAsc = (a: any, b: any) => {
  const toOctets = (ip: string) => {
    const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    if (!m) return [Infinity, Infinity, Infinity, Infinity]
    return m.slice(1).map(n => Number.parseInt(n, 10))
  }
  const A = toOctets(a.IP ?? "")
  const B = toOctets(b.IP ?? "")
  for (let i = 0; i < 4; i += 1) {
    if (A[i] !== B[i]) return A[i] - B[i]
  }
  return 0
}

const loadImage = async (url: string) => {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer)
}

export const buildPdfReport = async (payload: any, options: PdfReportOptions) => {
  const [logoImg, titleImg, subtitleImg] = await Promise.all([
    loadImage(logoAppUrl),
    loadImage(nameAppUrl),
    loadImage(scanTitleUrl),
  ])

  const doc = new PDFDocument({ margin: 50 })
  const stream = doc.pipe(blobStream())

  drawHeader(doc, { logoImg, titleImg, subtitleImg })
  drawGeneralInfoAndOrigins(doc, payload)
  drawHostsSection(doc, payload.Results)
  doc.addPage()
  drawLegendSection(doc)

  doc.end()

  await new Promise<void>((resolve) => {
    stream.on("finish", () => {
      const blob = stream.toBlob("application/pdf")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = options.fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      resolve()
    })
  })
}

const drawHeader = (
  doc: any,
  images: { logoImg: Uint8Array; titleImg: Uint8Array; subtitleImg: Uint8Array }
) => {
  const pageW = doc.page.width
  const margin = 50
  const topY = 10

  const logoW = 62
  const logoH = 62
  const titleW = 320
  const titleH = 35
  const subtitleW = 160
  const subtitleH = 26

  const logoX = pageW - margin + 40 - logoW
  const logoY = topY
  doc.image(images.logoImg, logoX, logoY, { width: logoW, height: logoH })

  const titleX = (pageW - titleW) / 2
  const titleY = topY + 20
  doc.image(images.titleImg, titleX, titleY, { width: titleW, height: titleH })

  const subtitleX = (pageW - subtitleW) / 2
  const subtitleY = titleY + titleH + 4
  doc.image(images.subtitleImg, subtitleX, subtitleY, {
    width: subtitleW,
    height: subtitleH,
  })

  doc.y = Math.max(logoY + logoH, subtitleY + subtitleH) + 5

  doc
    .moveTo(margin + 50, doc.y)
    .lineTo(pageW - margin - 50, doc.y)
    .strokeColor("#a8c1ee")
    .lineWidth(1.5)
    .stroke()

  doc.moveDown(0.6)
}

const drawGeneralInfoAndOrigins = (doc: any, payload: any) => {
  const margin = 50
  const colGap = 40
  const colWidth = (doc.page.width - 2 * margin - colGap) / 2

  const boxSize = 18
  const boxColor = "#2563EB"
  const textOffset = 6
  const indent = 12

  doc.moveDown(0.5)

  doc
    .fillColor("#444")
    .font("Helvetica")
    .fontSize(8)
    .text(
      "The following terms and their meaning can be found at the bottom of this PDF, section 4)",
      margin,
      doc.y,
      {
        align: "left",
      }
    )
  doc.moveDown(1.5)

  const sectionTop = doc.y

  const drawSectionTitle = (num: string, title: string, x: number, y: number) => {
    doc.rect(x, y, boxSize, boxSize).fill(boxColor)

    doc.fillColor("white").font("Helvetica-Bold").fontSize(10)
    const numWidth = doc.widthOfString(num)
    const numHeight = doc.currentLineHeight()
    const numX = x + (boxSize - numWidth) / 2
    const numY = y + (boxSize - numHeight) / 2 + 1
    doc.text(num, numX, numY, { lineBreak: false })

    doc.fillColor(boxColor).font("Helvetica-Bold").fontSize(12)
    doc.text(title, x + boxSize + textOffset, y + (boxSize - 12) / 2, {
      lineBreak: false,
    })

    doc.fillColor("black").fontSize(10)
    doc.y = y + boxSize + 6
  }

  let leftX = margin + 20
  let yLeft = sectionTop

  drawSectionTitle("1", "General Information:", leftX, yLeft)

  doc.y = yLeft + boxSize + 8

  const contentX = leftX + indent

  const { date, time, duration, tz } = parseDateTime(payload.Started, payload.Ended)
  const target = payload.Targets?.[0] ?? "N/A"

  let ipHost = "N/A"
  if (payload.Results && Array.isArray(payload.Results)) {
    const selfHost = payload.Results.find((h: any) => h.is_self)
    if (selfHost) ipHost = selfHost.IP || "N/A"
  }

  doc.font("Helvetica-Bold").text("Time of execution: ", contentX, doc.y, {
    continued: true,
  })
  doc.font("Helvetica").text(time)

  doc.font("Helvetica-Bold").text("Date: ", contentX, doc.y, { continued: true })
  doc.font("Helvetica").text(date)

  doc
    .moveTo(contentX, doc.y + 4)
    .lineTo(contentX + 150, doc.y + 4)
    .strokeColor("#D9D9D9")
    .lineWidth(1.5)
    .stroke()
  doc.moveDown(0.8)

  doc.font("Helvetica-Bold").text("Duration: ", contentX, doc.y, {
    continued: true,
  })
  doc.font("Helvetica").text(duration)

  doc.font("Helvetica-Bold").text("Timezone: ", contentX, doc.y, {
    continued: true,
  })
  doc.font("Helvetica").text(tz)

  doc
    .moveTo(contentX, doc.y + 4)
    .lineTo(contentX + 150, doc.y + 4)
    .strokeColor("#D9D9D9")
    .lineWidth(1.5)
    .stroke()
  doc.moveDown(0.8)

  doc.font("Helvetica-Bold").text("Target: ", contentX, doc.y, {
    continued: true,
  })
  doc.font("Helvetica").text(target)

  doc.font("Helvetica-Bold").text("IP Host: ", contentX, doc.y, {
    continued: true,
  })
  doc.font("Helvetica").text(ipHost)

  const afterLeftY = doc.y

  doc.y = sectionTop
  const rightX = leftX + colWidth + colGap

  drawSectionTitle("2", "Origins:", rightX, sectionTop)

  const originsMap: Record<string, { title: string; desc: string }> = {
    icmp: { title: "ICMP", desc: "Internet Control Message Protocol" },
    arp: { title: "ARP", desc: "Address Resolution Protocol" },
    dns: { title: "DNS", desc: "Domain Name System" },
    mac_lookup: { title: "MAC Lookup", desc: "" },
    os_fingerprint: { title: "OS Fingerprint", desc: "" },
    passive_fingerprint: { title: "Passive Fingerprint", desc: "" },
    tcp: { title: "TCP", desc: "Transmission Control Protocol" },
    udp: { title: "UDP", desc: "User Datagram Protocol" },
  }

  const firstHost = payload.Results?.[0]
  const activeOrigins = firstHost?.SourceModule || []

  activeOrigins.forEach((key: string) => {
    const item = originsMap[key]
    if (!item) return

    const bulletRadius = 2
    const bulletX = rightX
    const bulletY = doc.y + 5

    doc.circle(bulletX, bulletY, bulletRadius).fillColor("black").fill()

    const textX = bulletX + bulletRadius * 2 + 4

    doc
      .fillColor("black")
      .font("Helvetica-Bold")
      .text(item.title, textX, doc.y, { continued: !!item.desc })

    if (item.desc) {
      doc.fillColor("#444").font("Helvetica").text(" (" + item.desc + ")")
    } else {
      doc.text("")
    }
  })

  const afterRightY = doc.y
  doc.y = Math.max(afterLeftY, afterRightY) + 20

  doc.lineWidth(1).strokeColor("#a8c1ee").lineWidth(1.5)
  doc.moveTo(margin, doc.y).lineTo(doc.page.width - margin, doc.y).stroke()
  doc.moveDown(2)
}

const parseDateTime = (started: string, ended: string) => {
  if (!started) return { date: "N/A", time: "N/A", duration: "N/A", tz: "N/A" }

  const startDate = new Date(started)
  const endDate = ended ? new Date(ended) : null
  const date = startDate.toLocaleDateString("it-IT")
  const time = startDate.toLocaleTimeString("it-IT", { hour12: false })
  const tzOffsetMin = startDate.getTimezoneOffset()
  const tzHours = -tzOffsetMin / 60
  const tz = `GMT${tzHours >= 0 ? "+" : ""}${tzHours}`

  let duration = "N/A"
  if (endDate) {
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const hours = Math.floor(diffSec / 3600)
    const mins = Math.floor((diffSec % 3600) / 60)
    const secs = diffSec % 60
    duration = [
      hours ? `${hours}h` : null,
      mins ? `${mins}m` : null,
      `${secs}s`,
    ]
      .filter(Boolean)
      .join(" ")
  }

  return { date, time, duration, tz }
}

const measureHostBlockHeight = (host: any, margin: number, halfWidth: number) => {
  const fakeDoc = {
    y: 0,
    font: () => fakeDoc,
    fontSize: () => fakeDoc,
    fillColor: () => fakeDoc,
    strokeColor: () => fakeDoc,
    lineWidth: () => fakeDoc,
    text: () => {
      fakeDoc.y += 12
      return fakeDoc
    },
    moveDown: (lines = 1) => {
      fakeDoc.y += lines * 12
      return fakeDoc
    },
    rect: () => fakeDoc,
    fillAndStroke: () => fakeDoc,
    circle: () => fakeDoc,
    fill: () => fakeDoc,
    stroke: () => fakeDoc,
    moveTo: () => fakeDoc,
    lineTo: () => fakeDoc,
  }

  drawHostBlock(fakeDoc as unknown as any, host, margin, halfWidth)
  return fakeDoc.y
}

const drawHostsSection = (doc: any, results: any[]) => {
  if (!Array.isArray(results)) {
    console.error("drawHostsSection: results non è un array:", results)
    return
  }

  doc.moveDown(0.5)
  doc.fillColor("#444").font("Helvetica").fontSize(8).text(
    "The following terms and their meaning can be found at the bottom of this PDF, section 5)",
    50,
    doc.y,
    { align: "left" }
  )

  doc.moveDown(1)

  const margin = 75
  const usableWidth = doc.page.width - margin * 2
  const halfWidth = usableWidth / 2 - 10
  const boxSize = 16
  const startY = doc.y

  doc.rect(margin, startY, boxSize, boxSize).fillAndStroke("#2563EB", "#2563EB")
  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("3", margin, startY + 3, { width: boxSize, align: "center" })

  doc
    .fillColor("#2563EB")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Hosts found:", margin + boxSize + 8, startY + 2)
  doc.moveDown(0.6)

  const bottomMargin = 50
  const sortedResults = [...results].sort(compareByIpAsc)

  sortedResults.forEach((host) => {
    const blockHeight = measureHostBlockHeight(host, margin, halfWidth)
    if (doc.y + blockHeight > doc.page.height - bottomMargin) {
      doc.addPage()
    }
    drawHostBlock(doc, host, margin, halfWidth)
  })
}

const drawHostBlock = (doc: any, host: any, margin: number, halfWidth: number) => {
  const startX = 70
  const circleY = doc.y + 4

  let circleColor = "gray"
  if (host.RTT) {
    const rttMs = host.RTT / 1e6
    if (rttMs < 100) circleColor = "limegreen"
    else if (rttMs < 150) circleColor = "yellow"
    else circleColor = "red"
  }

  doc.circle(startX, circleY, 4).fillColor(circleColor).fill()

  doc
    .fillColor("black")
    .font("Helvetica")
    .fontSize(10)
    .text(`  ${host.IP}`, startX + 10, doc.y, { continued: true })
    .font("Helvetica-Bold")
    .text(`   Hostname:`, { continued: true })
    .font("Helvetica")
    .text(` ${host.Hostname || "-"}`)

  doc.moveDown(0.3)

  doc.strokeColor("#ddd").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke()

  doc.moveDown(1)

  const leftX = 70
  const rightX = 200
  let y = doc.y

  doc
    .font("Helvetica-Bold")
    .fillColor("black")
    .text("TTL:", leftX, y, { continued: true })
    .font("Helvetica")
    .text(` ${host.TTL || "-"}`)
  y = doc.y + 5
  doc
    .font("Helvetica-Bold")
    .text("RTT:", leftX, y, { continued: true })
    .font("Helvetica")
    .text(` ${host.RTT ? (host.RTT / 1e6).toFixed(2) + " s" : "-"}`)
  y = doc.y + 5
  doc
    .font("Helvetica-Bold")
    .text("MAC:", leftX, y, { continued: true })
    .font("Helvetica")
    .text(` ${host.MAC || "-"}`)

  y = doc.y - 45
  doc
    .font("Helvetica-Bold")
    .text("Vendor:", rightX, y, { continued: true })
    .font("Helvetica")
    .text(` ${host.Vendor || "-"}`)
  y += 15
  doc
    .font("Helvetica-Bold")
    .text("System:", rightX, y, { continued: true })
    .font("Helvetica")
    .text(`${host.OsGuess ? host.OsGuess : host.PassiveFingerprint ? host.PassiveFingerprint : "-"}`)

  doc.moveDown(2)

  const tcpX = margin
  const udpX = margin + halfWidth + 20
  const tableStartY = doc.y

  const drawTableHeader = (x: number, yPos: number, label: string) => {
    doc.rect(x, yPos, halfWidth, 16).fillAndStroke("#c7d7f5", "#c7d7f5")
    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(label, x, yPos + 3, { width: halfWidth, align: "center" })
  }

  const drawTableRows = (x: number, yPos: number, data: Record<string, string>) => {
    const portColW = halfWidth * 0.4
    const svcColW = halfWidth * 0.6
    let rowY = yPos

    Object.entries(data).forEach(([port, service]) => {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("black")
        .text(port, x + 5, rowY + 4, { width: portColW, align: "center" })

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("black")
        .text(service, x + portColW + 10, rowY + 4, { width: svcColW, align: "center" })

      rowY += 16

      doc.strokeColor("#ddd").lineWidth(0.8).moveTo(x, rowY).lineTo(x + halfWidth, rowY).stroke()
    })

    return rowY
  }

  let tcpEndY = tableStartY
  if (host.OpenPortsTCP && Object.keys(host.OpenPortsTCP).length > 0) {
    drawTableHeader(tcpX, tableStartY, "TCP PORTS")
    tcpEndY = drawTableRows(tcpX, tableStartY + 16, host.OpenPortsTCP)
  }

  let udpEndY = tableStartY
  if (host.OpenPortsUDP && Object.keys(host.OpenPortsUDP).length > 0) {
    drawTableHeader(udpX, tableStartY, "UDP PORTS")
    udpEndY = drawTableRows(udpX, tableStartY + 16, host.OpenPortsUDP)
  }

  doc.y = Math.max(tcpEndY, udpEndY) + 10

  doc.strokeColor("#a8c1ee").lineWidth(1.2).moveTo(50, doc.y).lineTo(550, doc.y).stroke()

  doc.moveDown(0.8)
}

const drawLegendSection = (doc: any) => {
  const margin = 75
  const boxSize = 16

  let startY = doc.y

  doc.rect(margin, startY, boxSize, boxSize).fillAndStroke("#2563EB", "#2563EB")
  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("4", margin, startY + 3, { width: boxSize, align: "center" })

  doc
    .fillColor("#2563EB")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Protocols meaning:", margin + boxSize + 8, startY + 2)
  doc.moveDown(1)

  const items1 = [
    ["ICMP", "Internet Control Message Protocol, usato per ping e traceroute."],
    ["ARP", "Address Resolution Protocol, converte IP in indirizzo MAC."],
    ["DNS", "Domain Name System, traduce nomi a dominio in indirizzi IP."],
    ["MAC Lookup", "Associa un MAC al produttore della scheda di rete."],
    ["Passive Fingerprint", "Deducere il sistema operativo osservando il traffico."],
    ["TCP", "Transmission Control Protocol, connessione affidabile (HTTP, SMTP…)."],
    ["UDP", "User Datagram Protocol, leggero e senza controllo d’errore (DNS, VoIP…)."],
  ]

  items1.forEach(([title, desc]) => {
    doc.font("Helvetica-Bold").fillColor("black").fontSize(10).text(`• ${title}`, {
      continued: true,
    })
    doc.font("Helvetica").fillColor("black").fontSize(10).text(` (${desc})`)
  })

  doc.moveDown(1.5)

  startY = doc.y

  doc.rect(margin, startY, boxSize, boxSize).fillAndStroke("#2563EB", "#2563EB")
  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("5", margin, startY + 3, { width: boxSize, align: "center" })

  doc
    .fillColor("#2563EB")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Other network concepts:", margin + boxSize + 8, startY + 2)
  doc.moveDown(1)

  doc.font("Helvetica-Bold").fontSize(11).fillColor("black").text("A) Concetti base:")
  doc.moveDown(0.5)

  const items2 = [
    ["TTL", "Time To Live, numero massimo di salti che un pacchetto può fare in rete."],
    ["RTT", "Round Trip Time, tempo di andata e ritorno di un pacchetto (latenza)."],
    ["MAC", "Media Access Control Address, identificativo univoco della scheda di rete."],
    ["Vendor", "Produttore associato a un MAC, ottenuto tramite database pubblici."],
  ]

  items2.forEach(([title, desc]) => {
    doc.font("Helvetica-Bold").fillColor("black").fontSize(10).text(`• ${title}:`, {
      continued: true,
    })
    doc.font("Helvetica").fillColor("black").fontSize(10).text(` ${desc}`)
  })

  doc.moveDown(1)

  doc.font("Helvetica-Bold").fontSize(11).fillColor("black").text("B) Colori pallini RTT:")
  doc.moveDown(0.5)

  const legendItems = [
    { color: "limegreen", label: "RTT < 100 ms (latenza ottima)" },
    { color: "yellow", label: "RTT < 150 ms (latenza accettabile)" },
    { color: "red", label: "RTT ≥ 150 ms (latenza elevata o degrado)" },
  ]

  legendItems.forEach((item) => {
    const y = doc.y + 4
    doc.circle(110, y, 3).fillColor(item.color).fill()
    doc.fillColor("black").font("Helvetica").fontSize(10).text(item.label, 120, doc.y)
    doc.moveDown(0.5)
  })

  doc.moveDown(1)
}

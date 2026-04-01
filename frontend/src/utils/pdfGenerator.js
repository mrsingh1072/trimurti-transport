import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate and download receipt PDF
 * @param {string} elementId - ID of HTML element to capture as PDF
 * @param {string} bookingId - Booking ID for filename
 * @param {Object} options - PDF generation options
 */
export const generateReceiptPDF = async (elementId, bookingId, options = {}) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with id "${elementId}" not found`)
      return false
    }

    // Show loading state
    const button = document.querySelector('[data-pdf-button]')
    if (button) {
      button.disabled = true
      button.textContent = 'Generating PDF...'
    }

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High quality
      backgroundColor: '#ffffff', // White background
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    // Get dimensions
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 190 // A4 width in mm (210 - 20 margins)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pageHeight = 277 // A4 height in mm

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let yPosition = 10

    // Add image
    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight)

    // Handle multi-page PDFs
    let heightLeft = imgHeight - pageHeight + 20
    let position = 0

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download PDF
    const filename = options.filename || `receipt_${bookingId}.pdf`
    pdf.save(filename)

    // Reset button state
    if (button) {
      button.disabled = false
      button.textContent = 'Download PDF'
    }

    return true
  } catch (error) {
    console.error('PDF generation failed:', error)
    alert('Failed to generate PDF. Please try again.')
    return false
  }
}

export const generateCustomReceiptPDF = (paymentData, bookingData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 12

    // ========== HEADER SECTION ==========
    // Company Name
    pdf.setFontSize(20)
    pdf.setTextColor(0, 102, 204)
    pdf.text('TRIMURTI TRANSPORT', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 7
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text('Professional Vehicle Rental Services', pageWidth / 2, yPosition, { align: 'center' })

    // Company Contact Details
    yPosition += 6
    pdf.setFontSize(8.5)
    pdf.setTextColor(80, 80, 80)
    pdf.text('Email: trimurtitransport1072@gmail.com | Phone: +91 8709905612', pageWidth / 2, yPosition, { align: 'center' })

    // Divider line
    yPosition += 8
    pdf.setDrawColor(200, 200, 200)
    pdf.line(15, yPosition, pageWidth - 15, yPosition)

    // Invoice number and date
    yPosition += 8
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Invoice #: ${paymentData._id.toString().slice(-6).toUpperCase()}`, 15, yPosition)
    pdf.text(
      `Date: ${new Date(paymentData.createdAt).toLocaleDateString('en-IN')}`,
      pageWidth - 50,
      yPosition
    )

    // Customer details
    yPosition += 15
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text('BOOKING DETAILS', 15, yPosition)

    yPosition += 7
    pdf.setFontSize(10)
    const customerName = paymentData.user?.name || 'N/A'
    const vehicleName = bookingData?.vehicle?.name || 'N/A'
    const checkIn = bookingData?.startDate
      ? new Date(bookingData.startDate).toLocaleDateString('en-IN')
      : 'N/A'
    const checkOut = bookingData?.endDate
      ? new Date(bookingData.endDate).toLocaleDateString('en-IN')
      : 'N/A'

    pdf.text(`Customer: ${customerName}`, 15, yPosition)
    yPosition += 6
    pdf.text(`Email: ${paymentData.user?.email || 'N/A'}`, 15, yPosition)
    yPosition += 6
    pdf.text(`Phone: ${paymentData.user?.phone || 'N/A'}`, 15, yPosition)

    // Booking info
    yPosition += 10
    pdf.text('VEHICLE & RENTAL INFO', 15, yPosition)

    yPosition += 7
    pdf.text(`Vehicle: ${vehicleName}`, 15, yPosition)
    yPosition += 6
    pdf.text(`Check-in: ${checkIn}`, 15, yPosition)
    yPosition += 6
    pdf.text(`Check-out: ${checkOut}`, 15, yPosition)
    yPosition += 6
    pdf.text(`Booking ID: ${bookingData?._id || 'N/A'}`, 15, yPosition)

    // Payment details
    yPosition += 10
    pdf.setFontSize(11)
    pdf.text('PAYMENT INFORMATION', 15, yPosition)

    yPosition += 7
    pdf.setFontSize(10)
    pdf.text(`Status: ${paymentData.status.toUpperCase()}`, 15, yPosition)
    yPosition += 6
    pdf.text(`Method: ${(paymentData.method || 'UPI').toUpperCase()}`, 15, yPosition)
    yPosition += 6
    pdf.text(`Payment Date: ${new Date(paymentData.createdAt).toLocaleString('en-IN')}`, 15, yPosition)

    // Amount box
    yPosition += 10
    pdf.setFillColor(240, 240, 240)
    pdf.rect(15, yPosition, pageWidth - 30, 12, 'F')
    pdf.setFontSize(12)
    pdf.setTextColor(0, 102, 204)
    pdf.text('TOTAL AMOUNT PAID', 15, yPosition + 4)
    pdf.setFontSize(14)
    pdf.text(`₹ ${paymentData.amount?.toLocaleString() || 0}`, pageWidth - 20, yPosition + 7, {
      align: 'right',
    })

    // Transaction IDs
    if (paymentData.status === 'completed') {
      yPosition += 18
      pdf.setFontSize(11)
      pdf.setTextColor(0, 0, 0)
      pdf.text('TRANSACTION REFERENCE', 15, yPosition)

      yPosition += 7
      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      if (paymentData.razorpayOrderId) {
        pdf.text(`Order ID: ${paymentData.razorpayOrderId}`, 15, yPosition)
        yPosition += 6
      }
      if (paymentData.razorpayPaymentId) {
        pdf.text(`Payment ID: ${paymentData.razorpayPaymentId}`, 15, yPosition)
      }
    }

    // ========== SIGNATURE SECTION ==========
    // Separator line above signature
    const signatureSectionY = pageHeight - 35
    pdf.setDrawColor(200, 200, 200)
    pdf.line(15, signatureSectionY, pageWidth - 15, signatureSectionY)

    // Authorized Signature label (bottom right)
    let signY = signatureSectionY + 5
    pdf.setFontSize(9)
    pdf.setTextColor(80, 80, 80)
    pdf.text('Authorized Signature', pageWidth - 50, signY, { align: 'left' })

    // Signature placeholder box (for visual organization)
    signY += 8
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(pageWidth - 50, signY, 35, 12)

    // TO ADD SIGNATURE IMAGE WHEN AVAILABLE:
    // 1. Create a signature.png file in frontend/public folder
    // 2. Convert to base64 or import as URL
    // 3. Uncomment code below:
    // try {
    //   const signatureImg = 'path/to/signature/image.png'
    //   pdf.addImage(signatureImg, 'PNG', pageWidth - 48, signY + 1, 31, 10)
    // } catch (e) {
    //   console.log('Signature image not found, using placeholder')
    // }

    // Company stamp/footer
    signY = pageHeight - 8
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text('Trimurti Transport Services', pageWidth - 20, signY, { align: 'right' })

    // Footer messages
    yPosition = pageHeight - 20
    pdf.setFontSize(10)
    pdf.setTextColor(150, 150, 150)
    pdf.text('Thank you for choosing Trimurti Transport!', pageWidth / 2, yPosition, {
      align: 'center',
    })
    yPosition += 5
    pdf.setFontSize(8)
    pdf.text('This is a digital receipt. Please keep it for your records.', pageWidth / 2, yPosition, {
      align: 'center',
    })

    // Download
    const filename = `receipt_${paymentData._id.toString().slice(-6)}.pdf`
    pdf.save(filename)

    return true
  } catch (error) {
    console.error('Custom PDF generation failed:', error)
    alert('Failed to generate PDF')
    return false
  }
}

/**
 * Helper function to add signature image to PDF
 * Call this when signature.png is available in public folder
 * 
 * Usage:
 * addSignatureToPDF(pdf, pageWidth, pageHeight, signatureImagePath)
 * 
 * @param {jsPDF} pdf - The PDF document object
 * @param {number} pageWidth - Page width in mm
 * @param {number} pageHeight - Page height in mm
 * @param {string} signatureImagePath - Path to signature image (e.g., '/signature.png')
 */
export const addSignatureToPDF = async (pdf, pageWidth, pageHeight, signatureImagePath) => {
  try {
    const signatureSectionY = pageHeight - 35
    const signY = signatureSectionY + 5 + 8

    // Add signature image from public folder or data URL
    pdf.addImage(signatureImagePath, 'PNG', pageWidth - 48, signY + 1, 31, 10)
    return true
  } catch (error) {
    console.warn('Could not add signature image:', error)
    return false
  }
}

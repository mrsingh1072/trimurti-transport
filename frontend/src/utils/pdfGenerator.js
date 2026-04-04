import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Load image from URL with proper error handling
 * @param {string} url - Image URL (e.g. '/signature.jpeg')
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = url

      img.onload = () => {
        console.log(`✓ Image loaded successfully from ${url}`)
        resolve(img)
      }

      img.onerror = (error) => {
        console.error(`❌ Failed to load image from: ${url}`, error)
        reject(new Error(`Failed to load image: ${url}`))
      }

      img.onabort = () => {
        console.error(`❌ Image loading aborted for: ${url}`)
        reject(new Error(`Image loading aborted: ${url}`))
      }

      // Set timeout for slow connections
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error(`Image loading timeout: ${url}`))
        }
      }, 10000) // 10 second timeout
    } catch (error) {
      reject(error)
    }
  })
}

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

export const generateCustomReceiptPDF = async (paymentData, bookingData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 12

    // ========== HEADER SECTION ==========
    // Company Name
    pdf.setFontSize(22)
    pdf.setTextColor(0, 102, 204)
    pdf.setFont(undefined, 'bold')
    pdf.text('TRIMURTI TRANSPORT', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 8
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text('Professional Vehicle Rental Services', pageWidth / 2, yPosition, { align: 'center' })

    // Company Contact Details
    yPosition += 6
    pdf.setFontSize(8)
    pdf.setTextColor(80, 80, 80)
    pdf.text('✉ Email: trimurtitransport1072@gmail.com  |  📞 Phone: +91 8709905612', pageWidth / 2, yPosition, { align: 'center' })

    // Divider line
    yPosition += 8
    pdf.setDrawColor(0, 102, 204)
    pdf.setLineWidth(0.5)
    pdf.line(12, yPosition, pageWidth - 12, yPosition)

    // Receipt type and reference
    yPosition += 10
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('BOOKING RECEIPT', 15, yPosition)

    // Invoice number and date
    yPosition += 8
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(60, 60, 60)
    pdf.text(`Receipt #: ${paymentData._id.toString().slice(-6).toUpperCase()}`, 15, yPosition)
    pdf.text(
      `Date: ${new Date(paymentData.createdAt).toLocaleDateString('en-IN')}`,
      pageWidth - 50,
      yPosition
    )

    // ========== CUSTOMER DETAILS SECTION ==========
    yPosition += 10
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('CUSTOMER INFORMATION', 15, yPosition)

    // Customer details box
    pdf.setFillColor(245, 245, 250)
    pdf.rect(15, yPosition + 2, pageWidth - 30, 18, 'F')

    yPosition += 7
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'normal')
    const customerName = paymentData.user?.name || 'N/A'
    const customerEmail = paymentData.user?.email || 'N/A'
    const customerPhone = paymentData.user?.phone || 'N/A'

    pdf.text(`Name: ${customerName}`, 18, yPosition)
    yPosition += 5
    pdf.text(`Email: ${customerEmail}`, 18, yPosition)
    yPosition += 5
    pdf.text(`Phone: ${customerPhone}`, 18, yPosition)

    // ========== VEHICLE & BOOKING DETAILS ==========
    yPosition += 13
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('VEHICLE & RENTAL DETAILS', 15, yPosition)

    // Details box
    pdf.setFillColor(245, 250, 245)
    pdf.rect(15, yPosition + 2, pageWidth - 30, 22, 'F')

    yPosition += 7
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'normal')
    const vehicleName = bookingData?.vehicle?.name || 'N/A'
    const vehicleCategory = bookingData?.vehicle?.category || 'N/A'
    const checkInDate = bookingData?.startDate
      ? new Date(bookingData.startDate).toLocaleDateString('en-IN')
      : 'N/A'
    const checkOutDate = bookingData?.endDate
      ? new Date(bookingData.endDate).toLocaleDateString('en-IN')
      : 'N/A'
    const duration = bookingData?.startDate && bookingData?.endDate
      ? Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))
      : 0

    pdf.text(`Vehicle: ${vehicleName} (${vehicleCategory})`, 18, yPosition)
    yPosition += 5
    pdf.text(`Check-in Date: ${checkInDate}`, 18, yPosition)
    yPosition += 5
    pdf.text(`Check-out Date: ${checkOutDate}`, 18, yPosition)
    yPosition += 5
    pdf.text(`Duration: ${duration} day(s)  |  Booking ID: ${bookingData?._id?.toString().slice(-6).toUpperCase() || 'N/A'}`, 18, yPosition)

    // ========== PRICING DETAILS ==========
    yPosition += 13
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('PRICING BREAKDOWN', 15, yPosition)

    // Pricing table
    yPosition += 6
    pdf.setFontSize(8.5)
    pdf.setDrawColor(200, 200, 200)
    
    // Table header
    pdf.setFillColor(230, 240, 250)
    pdf.rect(15, yPosition, pageWidth - 30, 4.5, 'F')
    pdf.setFont(undefined, 'bold')
    pdf.text('Description', 18, yPosition + 3)
    pdf.text('Rate', 130, yPosition + 3)
    pdf.text('Total', pageWidth - 20, yPosition + 3, { align: 'right' })

    yPosition += 5
    pdf.setFont(undefined, 'normal')
    pdf.setDrawColor(200, 200, 200)
    pdf.line(15, yPosition, pageWidth - 15, yPosition)

    // Rental cost
    yPosition += 4
    const pricePerDay = bookingData?.vehicle?.pricePerDay || 0
    const rentalCost = pricePerDay * duration
    pdf.text('Vehicle Rental', 18, yPosition)
    pdf.text(`₹${pricePerDay}/day × ${duration} days`, 130, yPosition)
    pdf.setFont(undefined, 'bold')
    pdf.text(`₹${rentalCost.toLocaleString('en-IN')}`, pageWidth - 20, yPosition, { align: 'right' })

    // Additional fees if any
    if ((bookingData?.lateFee || 0) > 0) {
      yPosition += 5
      pdf.setFont(undefined, 'normal')
      pdf.text('Late Fee', 18, yPosition)
      pdf.text(``, 130, yPosition)
      pdf.setFont(undefined, 'bold')
      pdf.text(`+₹${bookingData.lateFee.toLocaleString('en-IN')}`, pageWidth - 20, yPosition, { align: 'right' })
    }

    if ((bookingData?.damageFee || 0) > 0) {
      yPosition += 5
      pdf.setFont(undefined, 'normal')
      pdf.text('Damage Fee', 18, yPosition)
      pdf.text(``, 130, yPosition)
      pdf.setFont(undefined, 'bold')
      pdf.text(`+₹${bookingData.damageFee.toLocaleString('en-IN')}`, pageWidth - 20, yPosition, { align: 'right' })
    }

    // Total Amount
    yPosition += 7
    pdf.setDrawColor(0, 102, 204)
    pdf.setLineWidth(0.8)
    pdf.line(15, yPosition - 2, pageWidth - 15, yPosition - 2)
    pdf.setFillColor(240, 248, 255)
    pdf.rect(15, yPosition, pageWidth - 30, 7, 'F')
    
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 102, 204)
    pdf.text('TOTAL AMOUNT PAID', 18, yPosition + 5)
    const totalAmount = paymentData.amount || rentalCost
    pdf.text(`₹${totalAmount.toLocaleString('en-IN')}`, pageWidth - 20, yPosition + 5, { align: 'right' })

    // ========== PAYMENT INFORMATION ==========
    yPosition += 12
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('PAYMENT INFORMATION', 15, yPosition)

    yPosition += 6
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(60, 60, 60)
    pdf.text(`Status: ${paymentData.status?.toUpperCase() || 'COMPLETED'}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Method: ${(paymentData.method || 'RAZORPAY').toUpperCase()}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Payment Date: ${new Date(paymentData.createdAt).toLocaleString('en-IN')}`, 15, yPosition)

    // Transaction IDs
    if (paymentData.razorpayOrderId || paymentData.razorpayPaymentId) {
      yPosition += 8
      pdf.setFontSize(9)
      pdf.setFont(undefined, 'bold')
      pdf.text('TRANSACTION REFERENCE', 15, yPosition)

      yPosition += 5
      pdf.setFontSize(8)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(80, 80, 80)
      if (paymentData.razorpayOrderId) {
        pdf.text(`Order ID: ${paymentData.razorpayOrderId}`, 15, yPosition)
        yPosition += 4
      }
      if (paymentData.razorpayPaymentId) {
        pdf.text(`Payment ID: ${paymentData.razorpayPaymentId}`, 15, yPosition)
      }
    }

    // ========== SIGNATURE SECTION ==========
    yPosition = pageHeight - 32
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.3)
    pdf.line(12, yPosition, pageWidth - 12, yPosition)

    yPosition += 5
    await addSignatureToPDF(pdf, pageWidth, yPosition)

    // Footer messages
    yPosition = pageHeight - 12
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(0, 102, 204)
    pdf.text('Thank you for choosing Trimurti Transport!', pageWidth / 2, yPosition, {
      align: 'center',
    })

    yPosition += 5
    pdf.setFontSize(7)
    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(120, 120, 120)
    pdf.text('Please keep this receipt for your records. For any queries, contact us at trimurtitransport1072@gmail.com', pageWidth / 2, yPosition, {
      align: 'center',
    })

    // Download PDF
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
 * Loads signature.jpeg from public folder, converts to Base64, and embeds in PDF
 * 
 * @param {jsPDF} pdf - The PDF document object
 * @param {number} pageWidth - Page width in mm
 * @param {number} yPosition - Y position to place signature
 * @returns {Promise<boolean>} True if signature added successfully, false otherwise
 */
export const addSignatureToPDF = async (pdf, pageWidth, yPosition = null) => {
  try {
    console.log('📝 Loading signature image...')
    
    // Load image
    const img = await loadImage('/signature.jpeg')
    
    // Convert to Base64 using canvas with fixed dimensions
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    
    const WIDTH = 200
    const HEIGHT = 80
    canvas.width = WIDTH
    canvas.height = HEIGHT
    
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT)
    const base64 = canvas.toDataURL('image/jpeg', 0.7)
    
    // Add to PDF
    const signatureX = 15
    const signatureY = yPosition || 150
    
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')
    pdf.setTextColor(60, 60, 60)
    pdf.text('Authorized Officer', signatureX, signatureY)
    
    // Add signature image
    pdf.addImage(base64, 'JPEG', signatureX, signatureY + 2, 40, 18)
    
    // Company name below signature
    pdf.setFontSize(8)
    pdf.setFont(undefined, 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text('Trimurti Transport Services', signatureX + 20, signatureY + 22)
    
    console.log('✓ Signature image added to PDF successfully')
    return true
  } catch (error) {
    console.warn('⚠ Could not add signature image:', error.message)
    // Don't fail the whole PDF generation if signature fails
    return false
  }
}

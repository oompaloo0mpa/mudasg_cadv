// Global variable to store the uploaded image URL
let uploadedImageUrl = null;

// Function to preview selected image
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            const currentImage = document.getElementById('currentImage');
            
            previewImg.src = e.target.result;
            preview.style.display = 'inline-block';
            
            // Hide current image if it exists (for edit page)
            if (currentImage) {
                currentImage.style.display = 'none';
            }
            
            // Upload the image to S3
            uploadImageToS3(file);
        };
        reader.readAsDataURL(file);
    }
}

// Function to remove selected image
function removeImage() {
    const preview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('event_image');
    const currentImage = document.getElementById('currentImage');
    
    preview.style.display = 'none';
    fileInput.value = '';
    uploadedImageUrl = null;
    
    // Show current image again if it exists (for edit page)
    if (currentImage && currentImage.querySelector('img').src) {
        currentImage.style.display = 'block';
    }
}

// Function to upload image to S3
function uploadImageToS3(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Convert to base64
        const base64Data = e.target.result.split(',')[1];
        
        // Show loading state
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '<div class="text-center">Uploading...</div>';
        
        // Make API call to your Lambda function
        const request = new XMLHttpRequest();
        request.open('POST', 'https://pm1iuvkzx8.execute-api.us-east-1.amazonaws.com/upload-image', true);
        request.setRequestHeader('Content-Type', 'application/json');
        
        request.onload = function() {
            if (request.status === 200) {
                const response = JSON.parse(request.responseText);
                uploadedImageUrl = response.url;
                
                // Restore preview with uploaded image
                preview.innerHTML = `
                    <img id="previewImg" src="${response.url}" alt="Preview">
                    <button type="button" class="remove-image-btn" onclick="removeImage()">×</button>
                `;
                preview.style.display = 'inline-block';
                
                console.log('Image uploaded successfully:', response.url);
            } else {
                alert('Error uploading image. Please try again.');
                removeImage();
            }
        };
        
        request.onerror = function() {
            alert('Network error while uploading image. Please try again.');
            removeImage();
        };
        
        request.send(JSON.stringify({ image: base64Data }));
    };
    reader.readAsDataURL(file);
}

// Function to get the uploaded image URL (for form submission)
function getUploadedImageUrl() {
    return uploadedImageUrl;
}

// Function to set current image (for edit page)
function setCurrentImage(imageUrl) {
    if (imageUrl) {
        const currentImage = document.getElementById('currentImage');
        const currentImg = document.getElementById('currentImg');
        if (currentImage && currentImg) {
            currentImg.src = imageUrl;
            currentImage.style.display = 'block';
            uploadedImageUrl = imageUrl; // Set as current uploaded image
        }
    }
} 
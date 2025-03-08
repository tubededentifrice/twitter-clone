document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // UI Elements
    const profilePictureContainer = document.getElementById('profilePictureContainer');
    const profilePicture = document.getElementById('profilePicture');
    const profileUsername = document.getElementById('profileUsername');
    const followerCount = document.getElementById('followerCount');
    const followingCount = document.getElementById('followingCount');
    const tweetCount = document.getElementById('tweetCount');
    const followersList = document.getElementById('followersList');
    const followingList = document.getElementById('followingList');
    const userTweets = document.getElementById('userTweets');
    const profilePictureModal = new bootstrap.Modal(document.getElementById('profilePictureModal'));
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const saveProfilePictureBtn = document.getElementById('saveProfilePicture');
    const followersStatContainer = document.getElementById('followersStatContainer');
    const followingStatContainer = document.getElementById('followingStatContainer');
    const followButton = document.getElementById('followButton');
    
    // Variables
    let cropper;
    let isOwnProfile = true;
    let viewingUsername = '';
    
    // Check if we're viewing a specific user's profile
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');
    
    if (usernameParam) {
        // We're viewing someone else's profile
        viewingUsername = usernameParam;
        const currentUser = getUser();
        
        if (currentUser && currentUser.username === usernameParam) {
            // This is actually the current user's profile
            isOwnProfile = true;
        } else {
            // Viewing someone else's profile
            isOwnProfile = false;
            
            // Hide edit features
            if (profilePictureContainer) {
                profilePictureContainer.style.cursor = 'default';
                const overlay = profilePictureContainer.querySelector('.profile-picture-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
            }
            
            // Show follow button
            if (followButton) {
                followButton.classList.remove('d-none');
                checkFollowStatus(usernameParam);
            }
        }
        
        // Load the specified user's profile
        loadProfileData(usernameParam);
    } else {
        // Load the current user's profile
        loadProfileData();
    }
    
    // Event Listeners
    if (profilePictureContainer) {
        profilePictureContainer.addEventListener('click', function() {
            if (isOwnProfile) {
                profilePictureModal.show();
            }
        });
    }
    
    if (followButton) {
        followButton.addEventListener('click', function() {
            const action = followButton.getAttribute('data-action');
            if (action === 'follow') {
                followUser(viewingUsername);
            } else if (action === 'unfollow') {
                unfollowUser(viewingUsername);
            }
        });
    }
    
    followersStatContainer.addEventListener('click', function() {
        // Show followers tab
        const followersTab = document.querySelector('[href="#followers"]');
        if (followersTab) {
            followersTab.click();
        }
    });
    
    followingStatContainer.addEventListener('click', function() {
        // Show following tab
        const followingTab = document.querySelector('[href="#following"]');
        if (followingTab) {
            followingTab.click();
        }
    });
    
    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Read the file
            const reader = new FileReader();
            reader.onload = function(event) {
                // Show the preview container
                imagePreviewContainer.classList.remove('d-none');
                
                // Set the image source
                previewImage.src = event.target.result;
                
                // Destroy previous cropper if exists
                if (cropper) {
                    cropper.destroy();
                }
                
                // Initialize cropper
                cropper = new Cropper(previewImage, {
                    aspectRatio: 1, // Square
                    viewMode: 1,    // Restrict the crop box to not exceed the size of the canvas
                    minCropBoxWidth: 256,
                    minCropBoxHeight: 256,
                    cropBoxResizable: true,
                    background: false
                });
                
                // Enable save button
                saveProfilePictureBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });
    
    saveProfilePictureBtn.addEventListener('click', function() {
        if (!cropper) {
            return;
        }
        
        // Get the cropped canvas
        const canvas = cropper.getCroppedCanvas({
            width: 256,
            height: 256
        });
        
        if (!canvas) {
            return;
        }
        
        // Convert canvas to base64 string
        const base64Image = canvas.toDataURL();
        
        // Upload the image
        uploadProfilePicture(base64Image);
    });
    
    // Load user's tweet count
    fetchTweetCount();
    
    // Functions
    function loadProfileData(username = null) {
        const token = getToken();
        
        const url = username ? 
            `http://localhost:8000/api/profile/${username}` : 
            'http://localhost:8000/api/profile/me';
        
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load profile data');
            }
            return response.json();
        })
        .then(data => {
            // Update UI with profile data
            profileUsername.textContent = data.username;
            
            // Set profile picture if available
            if (data.profile_picture) {
                profilePicture.src = `http://localhost:8000${data.profile_picture}`;
            } else {
                // Use first letter of username as placeholder
                profilePicture.src = `https://via.placeholder.com/256/007bff/FFFFFF?text=${data.username.charAt(0).toUpperCase()}`;
            }
            
            // Update counts
            followerCount.textContent = data.follower_count;
            followingCount.textContent = data.following_count;
            
            // Update page title
            document.title = `${data.username} - Twitter Clone`;
            
            // Load followers and following lists
            if (isOwnProfile) {
                loadFollowers();
                loadFollowing();
            } else {
                // For other users' profiles, fetch their followers and following
                loadUserFollowers(data.username);
                loadUserFollowing(data.username);
            }
            
            // Update tweet count
            fetchTweetCount(data.username);
            
            // Load user's tweets
            loadUserTweets(data.username);
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            alert('Failed to load profile data');
        });
    }
    
    function loadUserTweets(username) {
        if (!username) {
            console.error('Username is required to load tweets');
            return;
        }
        
        // Show loading indicator
        showTweetLoadingIndicator(userTweets);
        
        fetch(`http://localhost:8000/api/tweets/user/${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user tweets');
                }
                return response.json();
            })
            .then(tweets => {
                if (tweets.length === 0) {
                    userTweets.innerHTML = `
                        <div class="text-center py-4">
                            <p class="text-muted">No tweets yet.</p>
                        </div>
                    `;
                    return;
                }
                
                // Display tweets using the component
                // Always show author information for consistency across the app
                renderTweets(tweets, userTweets, true);
            })
            .catch(error => {
                console.error('Error loading user tweets:', error);
                showTweetError(userTweets);
            });
    }
    
    function fetchTweetCount(username = null) {
        if (!username) {
            if (!localStorage.getItem('user')) {
                console.error('User not found in localStorage');
                tweetCount.textContent = '0';
                return;
            }
            
            try {
                username = JSON.parse(localStorage.getItem('user')).username;
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
                tweetCount.textContent = '0';
                return;
            }
        }
        
        fetch(`http://localhost:8000/api/tweets/count/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tweet count');
            }
            return response.json();
        })
        .then(data => {
            tweetCount.textContent = data.count;
        })
        .catch(error => {
            console.error('Error fetching tweet count:', error);
            tweetCount.textContent = '0';
        });
    }
    
    function uploadProfilePicture(base64Image) {
        const token = getToken();
        
        // Prepare form data
        const formData = new FormData();
        formData.append('profile_picture', base64Image);
        
        // Disable save button
        saveProfilePictureBtn.disabled = true;
        saveProfilePictureBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
        
        console.log('Uploading profile picture...');
        
        fetch('http://localhost:8000/api/profile/update-profile-picture', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // No Content-Type header for FormData
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update profile picture');
            }
            return response.json();
        })
        .then(data => {
            // Update the profile picture on the page
            profilePicture.src = `http://localhost:8000${data.profile_picture}`;
            
            // Close the modal
            profilePictureModal.hide();
            
            // Reset form
            imageInput.value = '';
            imagePreviewContainer.classList.add('d-none');
            
            // Re-enable save button
            saveProfilePictureBtn.disabled = false;
            saveProfilePictureBtn.textContent = 'Save';
            
            // Destroy cropper
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
        })
        .catch(error => {
            console.error('Error updating profile picture:', error);
            alert('Failed to update profile picture');
            
            // Re-enable save button
            saveProfilePictureBtn.disabled = false;
            saveProfilePictureBtn.textContent = 'Save';
        });
    }
    
    function loadFollowers() {
        const token = getToken();
        
        fetch('http://localhost:8000/api/profile/followers/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load followers');
            }
            return response.json();
        })
        .then(followers => {
            // Clear loading spinner
            followersList.innerHTML = '';
            
            if (followers.length === 0) {
                followersList.innerHTML = '<div class="text-center py-4">No followers yet</div>';
                return;
            }
            
            // Render followers
            followers.forEach(follower => {
                const followerItem = document.createElement('div');
                followerItem.className = 'follower-item';
                
                // Set profile picture
                let profilePicUrl = 'https://via.placeholder.com/48/007bff/FFFFFF?text=' + follower.username.charAt(0).toUpperCase();
                if (follower.profile_picture) {
                    profilePicUrl = `http://localhost:8000${follower.profile_picture}`;
                }
                
                followerItem.innerHTML = `
                    <a href="profile.html?username=${follower.username}">
                        <img src="${profilePicUrl}" alt="${follower.username}" class="follower-avatar">
                    </a>
                    <div class="follower-info">
                        <a href="profile.html?username=${follower.username}" class="text-decoration-none">
                            <span class="follower-username">@${follower.username}</span>
                        </a>
                    </div>
                `;
                
                followersList.appendChild(followerItem);
            });
        })
        .catch(error => {
            console.error('Error loading followers:', error);
            followersList.innerHTML = '<div class="text-center py-4">Failed to load followers</div>';
        });
    }
    
    function loadUserFollowers(username) {
        const token = getToken();
        
        fetch(`http://localhost:8000/api/profile/${username}/followers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load followers');
            }
            return response.json();
        })
        .then(followers => {
            // Clear loading spinner
            followersList.innerHTML = '';
            
            if (followers.length === 0) {
                followersList.innerHTML = '<div class="text-center py-4">No followers yet</div>';
                return;
            }
            
            // Render followers
            followers.forEach(follower => {
                const followerItem = document.createElement('div');
                followerItem.className = 'follower-item';
                
                // Set profile picture
                let profilePicUrl = 'https://via.placeholder.com/48/007bff/FFFFFF?text=' + follower.username.charAt(0).toUpperCase();
                if (follower.profile_picture) {
                    profilePicUrl = `http://localhost:8000${follower.profile_picture}`;
                }
                
                followerItem.innerHTML = `
                    <a href="profile.html?username=${follower.username}">
                        <img src="${profilePicUrl}" alt="${follower.username}" class="follower-avatar">
                    </a>
                    <div class="follower-info">
                        <a href="profile.html?username=${follower.username}" class="text-decoration-none">
                            <span class="follower-username">@${follower.username}</span>
                        </a>
                    </div>
                `;
                
                followersList.appendChild(followerItem);
            });
        })
        .catch(error => {
            console.error('Error loading followers:', error);
            followersList.innerHTML = '<div class="text-center py-4">Failed to load followers</div>';
        });
    }
    
    function loadUserFollowing(username) {
        const token = getToken();
        
        fetch(`http://localhost:8000/api/profile/${username}/following`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load following');
            }
            return response.json();
        })
        .then(following => {
            // Clear loading spinner
            followingList.innerHTML = '';
            
            if (following.length === 0) {
                followingList.innerHTML = '<div class="text-center py-4">Not following anyone yet</div>';
                return;
            }
            
            // Render following list
            following.forEach(user => {
                const followingItem = document.createElement('div');
                followingItem.className = 'follower-item';
                
                // Set profile picture
                let profilePicUrl = 'https://via.placeholder.com/48/007bff/FFFFFF?text=' + user.username.charAt(0).toUpperCase();
                if (user.profile_picture) {
                    profilePicUrl = `http://localhost:8000${user.profile_picture}`;
                }
                
                followingItem.innerHTML = `
                    <a href="profile.html?username=${user.username}">
                        <img src="${profilePicUrl}" alt="${user.username}" class="follower-avatar">
                    </a>
                    <div class="follower-info">
                        <a href="profile.html?username=${user.username}" class="text-decoration-none">
                            <span class="follower-username">@${user.username}</span>
                        </a>
                    </div>
                `;
                
                followingList.appendChild(followingItem);
            });
        })
        .catch(error => {
            console.error('Error loading following:', error);
            followingList.innerHTML = '<div class="text-center py-4">Failed to load following</div>';
        });
    }
    
    function loadFollowing() {
        const token = getToken();
        
        fetch('http://localhost:8000/api/profile/following/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load following');
            }
            return response.json();
        })
        .then(following => {
            // Clear loading spinner
            followingList.innerHTML = '';
            
            if (following.length === 0) {
                followingList.innerHTML = '<div class="text-center py-4">Not following anyone yet</div>';
                return;
            }
            
            // Render following
            following.forEach(user => {
                const followingItem = document.createElement('div');
                followingItem.className = 'follower-item';
                
                // Set profile picture
                let profilePicUrl = 'https://via.placeholder.com/48/007bff/FFFFFF?text=' + user.username.charAt(0).toUpperCase();
                if (user.profile_picture) {
                    profilePicUrl = `http://localhost:8000${user.profile_picture}`;
                }
                
                followingItem.innerHTML = `
                    <a href="profile.html?username=${user.username}">
                        <img src="${profilePicUrl}" alt="${user.username}" class="follower-avatar">
                    </a>
                    <div class="follower-info">
                        <a href="profile.html?username=${user.username}" class="text-decoration-none">
                            <span class="follower-username">@${user.username}</span>
                        </a>
                    </div>
                    <button class="btn btn-sm btn-outline-danger unfollow-btn" data-username="${user.username}">Unfollow</button>
                `;
                
                followingList.appendChild(followingItem);
            });
            
            // Add event listeners to unfollow buttons
            document.querySelectorAll('.unfollow-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const username = this.getAttribute('data-username');
                    unfollowUser(username);
                });
            });
        })
        .catch(error => {
            console.error('Error loading following:', error);
            followingList.innerHTML = '<div class="text-center py-4">Failed to load following</div>';
        });
    }
    
    function unfollowUser(username) {
        const token = getToken();
        
        fetch(`http://localhost:8000/api/profile/unfollow/${username}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to unfollow user');
            }
            return response.json();
        })
        .then(data => {
            // If we're on a profile page, update follow button
            if (followButton && viewingUsername === username) {
                followButton.textContent = 'Follow';
                followButton.classList.remove('btn-danger');
                followButton.classList.add('btn-primary');
                followButton.setAttribute('data-action', 'follow');
            } else {
                // Show a message if we're unfollowing from the following list
                alert(data.message);
            }
            
            // Reload following list and count
            loadProfileData(viewingUsername || null);
            
            // Also refresh followers and following lists if viewing someone's profile
            if (!isOwnProfile && viewingUsername) {
                loadUserFollowers(viewingUsername);
                loadUserFollowing(viewingUsername);
            }
        })
        .catch(error => {
            console.error('Error unfollowing user:', error);
            alert('Failed to unfollow user');
        });
    }
    
    function followUser(username) {
        const token = getToken();
        
        fetch(`http://localhost:8000/api/profile/follow/${username}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to follow user');
            }
            return response.json();
        })
        .then(data => {
            // Update follow button
            if (followButton) {
                followButton.textContent = 'Unfollow';
                followButton.classList.remove('btn-primary');
                followButton.classList.add('btn-danger');
                followButton.setAttribute('data-action', 'unfollow');
            }
            
            // Reload profile data to update counts and followers list
            loadProfileData(username);
            
            // Also refresh followers and following lists if viewing someone's profile
            if (!isOwnProfile && viewingUsername) {
                loadUserFollowers(viewingUsername);
                loadUserFollowing(viewingUsername);
            }
        })
        .catch(error => {
            console.error('Error following user:', error);
            alert('Failed to follow user');
        });
    }
    
    function checkFollowStatus(username) {
        const token = getToken();
        
        fetch(`http://localhost:8000/api/profile/following/list`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to check follow status');
            }
            return response.json();
        })
        .then(following => {
            // Check if the viewed user is in the following list
            const isFollowing = following.some(user => user.username === username);
            
            if (isFollowing) {
                followButton.textContent = 'Unfollow';
                followButton.classList.remove('btn-primary');
                followButton.classList.add('btn-danger');
                followButton.setAttribute('data-action', 'unfollow');
            } else {
                followButton.textContent = 'Follow';
                followButton.classList.remove('btn-danger');
                followButton.classList.add('btn-primary');
                followButton.setAttribute('data-action', 'follow');
            }
        })
        .catch(error => {
            console.error('Error checking follow status:', error);
            // Default to not following
            followButton.textContent = 'Follow';
            followButton.setAttribute('data-action', 'follow');
        });
    }
    
    // Note: Tweet date formatting is now handled by the tweet component
});
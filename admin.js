
// --- EMAIL SYSTEM (WEBMAIL) ---
let currentEmailBox = 'inbox';
let allEmails = [];

async function loadEmails(box) {
  currentEmailBox = box;
  document.getElementById('btn-inbox').classList.toggle('btn-primary', box === 'inbox');
  document.getElementById('btn-inbox').classList.toggle('btn-outline', box !== 'inbox');
  document.getElementById('btn-outbox').classList.toggle('btn-primary', box === 'outbox');
  document.getElementById('btn-outbox').classList.toggle('btn-outline', box !== 'outbox');
  
  const container = document.getElementById('email-list-container');
  container.innerHTML = '<div style="text-align: center; padding: 40px; color: #8fa8c0;"><i class="fa-solid fa-spinner fa-spin"></i> ط¬ط§ط±ظٹ ط§ظ„طھط­ظ…ظٹظ„...</div>';
  
  try {
    const res = await fetch(\https://belami-store-default-rtdb.firebaseio.com/\.json\);
    const data = await res.json();
    allEmails = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
    
    // Sort by date descending
    allEmails.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    
    // Update Inbox Unread Badge
    if (box === 'inbox') {
      const unreadCount = allEmails.filter(e => !e.read).length;
      const badge = document.getElementById('inbox-badge');
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
    
    renderEmailList();
  } catch(e) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: red;">ط®ط·ط£ ظپظٹ طھط­ظ…ظٹظ„ ط§ظ„ط¨ط±ظٹط¯</div>';
  }
}

function renderEmailList() {
  const container = document.getElementById('email-list-container');
  if (allEmails.length === 0) {
    container.innerHTML = \<div style="text-align: center; padding: 40px; color: #8fa8c0;"><i class="fa-solid fa-envelope-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i><br>طµظ†ط¯ظˆظ‚ \ ظپط§ط±ط؛</div>\;
    return;
  }
  
  let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
  allEmails.forEach(email => {
    const isUnread = currentEmailBox === 'inbox' && !email.read;
    const dateStr = email.date ? new Date(email.date).toLocaleString('ar-SA') : '';
    const contact = currentEmailBox === 'inbox' ? email.from : email.to;
    const subjectStr = email.subject || 'ط¨ط¯ظˆظ† ظ…ظˆط¶ظˆط¹';
    
    html += \
      <div onclick="openReadEmailModal('\')" style="background: \; border: 1px solid \; padding: 15px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;">
        <div style="flex: 1; overflow: hidden;">
          <div style="font-weight: \; color: var(--primary); margin-bottom: 5px; font-size: 0.95rem;">\</div>
          <div style="color: #666; font-size: 0.85rem; display: flex; gap: 10px; align-items: center;">
            <span><i class="fa-solid \"></i> \</span>
          </div>
        </div>
        <div style="font-size: 0.8rem; color: #999; white-space: nowrap; margin-right: 15px;">
          \
          \
        </div>
      </div>
    \;
  });
  html += '</div>';
  container.innerHTML = html;
}

async function openReadEmailModal(id) {
  const email = allEmails.find(e => e.id === id);
  if (!email) return;
  
  document.getElementById('read-email-subject').textContent = email.subject || 'ط¨ط¯ظˆظ† ظ…ظˆط¶ظˆط¹';
  document.getElementById('read-email-contact').textContent = currentEmailBox === 'inbox' ? email.from : email.to;
  document.getElementById('read-email-date').textContent = email.date ? new Date(email.date).toLocaleString('ar-SA') : '';
  
  // Set HTML content safely
  const bodyContainer = document.getElementById('read-email-body');
  bodyContainer.innerHTML = email.html || email.text || '<span style="color: #999;">ظ„ط§ ظٹظˆط¬ط¯ ظ†طµ</span>';
  
  document.getElementById('read-email-modal').style.display = 'flex';
  document.getElementById('read-email-modal').style.opacity = '1';
  
  // If inbox and unread, mark as read
  if (currentEmailBox === 'inbox' && !email.read) {
    email.read = true;
    try {
      await fetch(\https://belami-store-default-rtdb.firebaseio.com/inbox/\.json\, {
        method: 'PATCH',
        body: JSON.stringify({ read: true })
      });
      // Update badge visually without reload
      const unreadCount = allEmails.filter(e => !e.read).length;
      const badge = document.getElementById('inbox-badge');
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
      renderEmailList();
    } catch(e) {}
  }
}

function closeReadEmailModal() {
  document.getElementById('read-email-modal').style.opacity = '0';
  setTimeout(() => document.getElementById('read-email-modal').style.display = 'none', 300);
}

function replyEmail() {
  const contact = document.getElementById('read-email-contact').textContent;
  const subject = document.getElementById('read-email-subject').textContent;
  closeReadEmailModal();
  openComposeModal(contact, \ط±ط¯: \\);
}

function openComposeModal(to = '', subject = '') {
  document.getElementById('compose-to').value = to;
  document.getElementById('compose-subject').value = subject;
  document.getElementById('compose-body').value = '';
  document.getElementById('compose-modal').style.display = 'flex';
  document.getElementById('compose-modal').style.opacity = '1';
}

function closeComposeModal() {
  document.getElementById('compose-modal').style.opacity = '0';
  setTimeout(() => document.getElementById('compose-modal').style.display = 'none', 300);
}

async function sendCustomEmail() {
  const to = document.getElementById('compose-to').value.trim();
  const subject = document.getElementById('compose-subject').value.trim();
  const body = document.getElementById('compose-body').value.trim();
  
  if (!to || !subject || !body) {
    return toast('ظٹط±ط¬ظ‰ طھط¹ط¨ط¦ط© ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ„');
  }
  
  const btn = document.getElementById('btn-send-email');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ط¬ط§ط±ظٹ ط§ظ„ط¥ط±ط³ط§ظ„...';
  btn.disabled = true;
  
  try {
    const payload = {
      to: to,
      subject: subject,
      body: body.replace(/\\n/g, '<br>')
    };
    
    // Send via Google Apps Script (which forwards to Resend)
    const res = await fetch('https://script.google.com/macros/s/AKfycbxmGeVP0tq9V00EHwLW-32EdfD6fgMNGYBwKrkSY4pnzr7dXWVbr6sPfLOrj4au2F5i/exec', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    // Save to Outbox in Firebase
    await fetch('https://belami-store-default-rtdb.firebaseio.com/outbox.json', {
      method: 'POST',
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: payload.body,
        date: new Date().toISOString()
      })
    });
    
    toast('طھظ… ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط© ط¨ظ†ط¬ط§ط­!');
    closeComposeModal();
    if (currentEmailBox === 'outbox') loadEmails('outbox');
    
  } catch (e) {
    toast('ظپط´ظ„ ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©');
  }
  
  btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> ط¥ط±ط³ط§ظ„';
  btn.disabled = false;
}
setTimeout(function(){ if(typeof loadEmails === 'function') loadEmails('inbox'); }, 2000); 

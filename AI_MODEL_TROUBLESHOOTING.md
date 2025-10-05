# 🔧 AI Model Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Unable to connect to model server" Error**

**Symptoms:**
- Error message: "Prediction request failed: Unable to connect to model server"
- Console shows: `ECONNREFUSED` or `fetch failed`
- Predictions don't work in the web app

**Solution:**
The Python model server is not running. Start it with:

```bash
# Option 1: Use the startup script (recommended)
./start-ai-model.sh

# Option 2: Manual start
cd backend
python3 model_server.py
```

**Verification:**
```bash
# Check if server is running
curl http://localhost:5001/health

# Should return:
{
  "status": "healthy",
  "model_loaded": true,
  "features_count": 12
}
```

---

### **Issue 2: "Model not loaded" Error**

**Symptoms:**
- Server is running but predictions fail
- Health check shows `"model_loaded": false`

**Solution:**
The AI model failed to load. Check the logs:

```bash
# Check the model server logs
cat backend/model_server.log

# Common fixes:
# 1. Install missing dependencies
cd backend
pip install -r requirements.txt

# 2. Check if data files exist
ls -la data/
# Should show: mock_food_surplus_data.csv, etc.

# 3. Restart the server
pkill -f model_server.py
cd backend && python3 model_server.py
```

---

### **Issue 3: "Invalid date" Error**

**Symptoms:**
- Form shows "invalid date" error
- Date field doesn't work properly

**Solution:**
This was fixed! The date field now:
- ✅ Defaults to tomorrow's date
- ✅ Validates date format
- ✅ Prevents past dates
- ✅ Shows helpful labels

**If still having issues:**
1. Clear browser cache
2. Refresh the page
3. Make sure you're using a recent date (YYYY-MM-DD format)

---

### **Issue 4: Predictions Don't Persist**

**Symptoms:**
- Predictions disappear after page refresh
- New predictions aren't saved

**Solution:**
This was fixed! Predictions now persist automatically. If still having issues:

```bash
# Check if the predictions API is working
curl http://localhost:3000/api/predictions?donorId=donor-1

# Should return your saved predictions
```

---

### **Issue 5: Port Conflicts**

**Symptoms:**
- "Port 5001 is in use" error
- Model server won't start

**Solution:**
```bash
# Find what's using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or use a different port
# Edit backend/model_server.py and change port=5001 to port=5002
# Then update frontend-mvp/.env.local: MODEL_SERVER_URL=http://localhost:5002
```

---

## 🛠️ **Quick Fixes**

### **Restart Everything:**
```bash
# 1. Stop all servers
pkill -f "next dev"
pkill -f model_server.py

# 2. Start Python model server
cd backend && python3 model_server.py &

# 3. Start Next.js frontend
cd frontend-mvp && npm run dev
```

### **Check System Status:**
```bash
# Check if Python server is running
curl http://localhost:5001/health

# Check if Next.js server is running
curl http://localhost:3000/api/health

# Check if predictions API works
curl http://localhost:3000/api/predictions?donorId=donor-1
```

### **View Logs:**
```bash
# Python model server logs
tail -f backend/model_server.log

# Next.js server logs (in terminal where you ran npm run dev)
# Look for error messages in the browser console (F12)
```

---

## 🎯 **Expected Behavior**

### **When Everything Works:**
1. ✅ Python server responds to health checks
2. ✅ AI predictions work in the web app
3. ✅ Predictions persist after page refresh
4. ✅ Date validation works properly
5. ✅ No console errors

### **Health Check Responses:**
```bash
# Python server (port 5001)
curl http://localhost:5001/health
# Returns: {"status": "healthy", "model_loaded": true, ...}

# Next.js server (port 3000)
curl http://localhost:3000/api/health
# Returns: {"status": "healthy", "services": {...}, ...}
```

---

## 🚀 **Startup Checklist**

Before using the AI predictions:

1. **✅ Python Model Server Running:**
   ```bash
   curl http://localhost:5001/health
   ```

2. **✅ Next.js Frontend Running:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **✅ Test Prediction:**
   ```bash
   curl -X POST http://localhost:3000/api/predict \
     -H "Content-Type: application/json" \
     -d '{"store_id": "1", "product_id": "1", "daily_sales": 50, "stock_level": 100}'
   ```

4. **✅ Test Persistence:**
   - Create a prediction in the web app
   - Refresh the page
   - Prediction should still be there

---

## 📞 **Still Having Issues?**

If none of these solutions work:

1. **Check the logs** for specific error messages
2. **Restart everything** (Python server + Next.js)
3. **Clear browser cache** and try again
4. **Check file permissions** on the backend directory
5. **Verify Python dependencies** are installed

The most common issue is the Python model server not running. Always start with:
```bash
./start-ai-model.sh
```

🎉 **Your AI predictions should work perfectly after following these steps!**

/**
 * e-BK Career Self-Efficacy - Cloud Database Synchronization Layer
 * SMKN 1 Mejayan Academic Counseling System
 * 
 * Supports Firebase Firestore (Web Compat SDK) with seamless LocalStorage fallback.
 * Enables real-time synchronization between Teacher laptop dashboard and Student mobile phones.
 */

(function () {
  'use strict';

  const STORAGE_KEY_CONFIG = 'ebk_firebase_config';
  const STORAGE_KEY_SYNC_TIME = 'ebk_cloud_last_sync';

  // State
  let db = null;
  let isConnected = false;
  let listeners = [];

  // Default demo / placeholder config (User can replace with their own Firebase project credentials)
  function getSavedConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading saved Firebase config:', e);
    }
    return null;
  }

  function initFirebase() {
    const config = getSavedConfig();
    if (!config || !config.apiKey || !config.projectId) {
      isConnected = false;
      return false;
    }

    if (typeof window.firebase === 'undefined') {
      console.info('Firebase SDK not loaded (offline or blocked). LocalStorage mode active.');
      isConnected = false;
      return false;
    }

    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      db = window.firebase.firestore();
      isConnected = true;
      console.info('Connected to Firebase Firestore:', config.projectId);
      return true;
    } catch (e) {
      console.warn('Firebase init error:', e);
      isConnected = false;
      return false;
    }
  }

  // Public Cloud Service API
  window.ebkCloud = {
    isConnected: function () {
      return isConnected && db !== null;
    },

    getConfig: getSavedConfig,

    saveConfig: function (configObj) {
      if (!configObj || !configObj.projectId) {
        throw new Error('Project ID Firebase wajib diisi.');
      }
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configObj));
      return initFirebase();
    },

    removeConfig: function () {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
      isConnected = false;
      db = null;
    },

    getLastSyncTime: function () {
      return localStorage.getItem(STORAGE_KEY_SYNC_TIME) || 'Belum pernah disinkronkan';
    },

    setLastSyncTime: function () {
      const nowStr = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      localStorage.setItem(STORAGE_KEY_SYNC_TIME, nowStr);
    },

    // -------------------------------------------------------------------------
    // Teachers Collection
    // -------------------------------------------------------------------------
    saveTeacher: async function (teacher) {
      if (!this.isConnected()) return false;
      try {
        await db.collection('teachers').doc(teacher.id).set({
          ...teacher,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        this.setLastSyncTime();
        return true;
      } catch (err) {
        console.warn('Cloud saveTeacher error:', err);
        return false;
      }
    },

    fetchTeachers: async function () {
      if (!this.isConnected()) return null;
      try {
        const snap = await db.collection('teachers').get();
        const list = [];
        snap.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.warn('Cloud fetchTeachers error:', err);
        return null;
      }
    },

    // -------------------------------------------------------------------------
    // Student Assessments Collection
    // -------------------------------------------------------------------------
    saveAssessment: async function (nisn, data) {
      if (!this.isConnected()) return false;
      try {
        await db.collection('assessments').doc(nisn).set({
          ...data,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        this.setLastSyncTime();
        return true;
      } catch (err) {
        console.warn('Cloud saveAssessment error:', err);
        return false;
      }
    },

    fetchAllAssessments: async function () {
      if (!this.isConnected()) return null;
      try {
        const snap = await db.collection('assessments').get();
        const map = {};
        snap.forEach(doc => {
          map[doc.id] = doc.data();
        });
        return map;
      } catch (err) {
        console.warn('Cloud fetchAllAssessments error:', err);
        return null;
      }
    },

    // -------------------------------------------------------------------------
    // Career Modules Collection
    // -------------------------------------------------------------------------
    saveModules: async function (modules) {
      if (!this.isConnected()) return false;
      try {
        const batch = db.batch();
        modules.forEach(m => {
          const docRef = db.collection('modules').doc(m.id);
          batch.set(docRef, { ...m, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        });
        await batch.commit();
        this.setLastSyncTime();
        return true;
      } catch (err) {
        console.warn('Cloud saveModules error:', err);
        return false;
      }
    },

    fetchModules: async function () {
      if (!this.isConnected()) return null;
      try {
        const snap = await db.collection('modules').get();
        if (snap.empty) return null;
        const list = [];
        snap.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.warn('Cloud fetchModules error:', err);
        return null;
      }
    },

    // -------------------------------------------------------------------------
    // Assessment Questions Collection
    // -------------------------------------------------------------------------
    saveQuestions: async function (questions) {
      if (!this.isConnected()) return false;
      try {
        await db.collection('app_settings').doc('questions').set({
          items: questions,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        this.setLastSyncTime();
        return true;
      } catch (err) {
        console.warn('Cloud saveQuestions error:', err);
        return false;
      }
    },

    fetchQuestions: async function () {
      if (!this.isConnected()) return null;
      try {
        const doc = await db.collection('app_settings').doc('questions').get();
        if (doc.exists && doc.data().items) {
          return doc.data().items;
        }
        return null;
      } catch (err) {
        console.warn('Cloud fetchQuestions error:', err);
        return null;
      }
    },

    // -------------------------------------------------------------------------
    // Module Quizzes Collection
    // -------------------------------------------------------------------------
    saveQuizzes: async function (quizzes) {
      if (!this.isConnected()) return false;
      try {
        await db.collection('app_settings').doc('quizzes').set({
          items: quizzes,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        this.setLastSyncTime();
        return true;
      } catch (err) {
        console.warn('Cloud saveQuizzes error:', err);
        return false;
      }
    },

    fetchQuizzes: async function () {
      if (!this.isConnected()) return null;
      try {
        const doc = await db.collection('app_settings').doc('quizzes').get();
        if (doc.exists && doc.data().items) {
          return doc.data().items;
        }
        return null;
      } catch (err) {
        console.warn('Cloud fetchQuizzes error:', err);
        return null;
      }
    },

    // -------------------------------------------------------------------------
    // Counseling Requests Collection
    // -------------------------------------------------------------------------
    saveCounselingRequest: async function (req) {
      if (!this.isConnected()) return false;
      try {
        await db.collection('counseling').doc(req.id).set({
          ...req,
          updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        this.setLastSyncTime();
        return true;
      } catch (err) {
        console.warn('Cloud saveCounselingRequest error:', err);
        return false;
      }
    },

    fetchCounselingRequests: async function () {
      if (!this.isConnected()) return null;
      try {
        const snap = await db.collection('counseling').orderBy('updatedAt', 'desc').get();
        const list = [];
        snap.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.warn('Cloud fetchCounselingRequests error:', err);
        return null;
      }
    }
  };

  // Attempt initial auto-connection if credentials exist
  document.addEventListener('DOMContentLoaded', function () {
    initFirebase();
  });

})();

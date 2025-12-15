/**
 * Database Connection Manager
 * Used to connect and manage MatrixOne database connections
 */

import mysql from 'mysql2/promise'
import { config } from '../config.js'

/**
 * Database Connection Manager Class
 */
export class DbConnectionManager {
    constructor(dbConfig = null) {
        this.config = dbConfig || config.defaultDbConfig
        this.connection = null
        this.testDatabases = new Set()
    }

    /**
     * Establish database connection
     */
    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: this.config.host,
                port: this.config.port,
                user: this.config.user,
                password: this.config.password,
            })
            await this.connection.query('SELECT 1')
            return true
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`)
        }
    }

    /**
     * Close database connection
     */
    async disconnect() {
        if (this.connection) {
            await this.connection.end()
            this.connection = null
        }
    }

    /**
     * Check if connection is alive
     */
    async isAlive() {
        if (!this.connection) return false
        try {
            await this.connection.query('SELECT 1')
            return true
        } catch (error) {
            return false
        }
    }

    /**
     * Ensure connection is alive
     */
    async ensureConnection() {
        if (!await this.isAlive()) {
            await this.connect()
        }
    }

    /**
     * Execute SQL query
     */
    async query(sql) {
        await this.ensureConnection()
        try {
            const [rows] = await this.connection.query(sql)
            return rows
        } catch (error) {
            throw error
        }
    }

    /**
     * Create isolated test database
     */
    async createTestDatabase(baseName = 'test') {
        await this.ensureConnection()
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(7)
        const dbName = `doc_test_${baseName}_${timestamp}_${random}`
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .substring(0, 64)

        try {
            await this.connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
            await this.connection.query(`USE \`${dbName}\``)
            this.testDatabases.add(dbName)
            return dbName
        } catch (error) {
            throw new Error(`Failed to create test database: ${error.message}`)
        }
    }

    /**
     * Drop test database
     */
    async dropTestDatabase(dbName) {
        await this.ensureConnection()
        try {
            await this.connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``)
            this.testDatabases.delete(dbName)
        } catch (error) {
            console.warn(`Failed to drop test database: ${error.message}`)
        }
    }

    /**
     * Clean up all test databases
     */
    async cleanupAllTestDatabases() {
        const databases = Array.from(this.testDatabases)
        for (const dbName of databases) {
            await this.dropTestDatabase(dbName)
        }
    }

    /**
     * Get database version
     */
    async getVersion() {
        await this.ensureConnection()
        const rows = await this.query('SELECT VERSION() as version')
        return rows[0]?.version || 'unknown'
    }
}

export default DbConnectionManager
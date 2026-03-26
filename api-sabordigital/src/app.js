const express = require('express')
const pool = require('./config/database')

const app = express()

app.use(express.json())

const queryAsync = (sql, values = []) => {

    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err, results) => {
            if (err) reject(err)
                else resolve(results)

            })
        })
}

app.get('/', (req, res) => {
    res.send("api-sabordigital")
})

app.get('/produtos', async (req,res) => {
    try{
        const produtos = await queryAsync('SELECT * FROM produto ORDER BY id')

        res.json({
            sucesso: true,
            dados: produtos,
            total: produtos.length
        })

    } catch (erro) {
        console.error('Erro ao listar produtos:', erro)
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar produtos',
            erro: erro.message
        })
    }
   
})

app.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params

        if (!id || isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do produto inválido.'
            })
        }

        const produto = await queryAsync('SELECT * FROM produto WHERE id = ?', [id])

        if (produto.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Produto não encontrado'
            })
        }

        res.json({
            sucesso: true,
            dados: produto[0]
        })

    } catch (erro) {
        console.error('Erro ao encontrar produto:', erro)
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao encontrar produto',
            erro: erro.message
        })
    }
})

app.post('/produtos', async(req,res) =>{
    try {
        const {id, nome, descricao, preco, disponibilidade } = req.body

        if(!nome || !descricao || !preco || !disponibilidade ){
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, descrição, preço e disponibilidade são obrigatórios'
            })
        }

        if(typeof preco !== 'number' || preco <= 0 ){
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preço deve ser um número positivo.'
            })
        }

        const novoProduto = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            duracao,
            disponibilidade: disponibilidade.trim()
        }

        const resultado = await queryAsync('INSERT INTO produto SET ?',[novoProduto])

        res.status(201).json({
            sucesso: true,
            mensagem: 'Produto cadastrado com sucesso.',
            id: resultado.insertId
        })
    } catch (erro) {
        console.error('Erro ao cadastrar produto:', erro)
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao salvar produto.',
            erro: erro.message
        })
    }
} )

module.exports = app
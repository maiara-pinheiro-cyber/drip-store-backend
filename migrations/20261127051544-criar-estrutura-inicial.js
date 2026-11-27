
'use strict';

/**
 * Migration inicial do Drip Store.
 *
 * Cria as tabelas quando não existem.
 * Preserva as tabelas e os dados de bancos já existentes.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const tabelasExistentes = await queryInterface.showAllTables();

    const existentes = new Set(
      tabelasExistentes.map((tabela) =>
        typeof tabela === 'string' ? tabela : tabela.tableName
      )
    );

    const existe = (nome) => existentes.has(nome);

    // Tabela de usuários
    if (!existe('users')) {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        firstname: {
          type: Sequelize.STRING,
          allowNull: false
        },
        surname: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });
    }

    // Tabela de categorias
    if (!existe('categories')) {
      await queryInterface.createTable('categories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        use_in_menu: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });
    }

    // Tabela de produtos
    if (!existe('products')) {
      await queryInterface.createTable('products', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        use_in_menu: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        description: {
          type: Sequelize.STRING(1000),
          allowNull: true
        },
        price: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        price_with_discount: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });
    }

    // Tabela de imagens dos produtos
    if (!existe('product_images')) {
      await queryInterface.createTable('product_images', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        path: {
          type: Sequelize.STRING,
          allowNull: false
        }
      });
    }

    // Tabela de opções dos produtos
    if (!existe('product_options')) {
      await queryInterface.createTable('product_options', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        shape: {
          type: Sequelize.ENUM('square', 'circle'),
          allowNull: false,
          defaultValue: 'square'
        },
        radius: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        type: {
          type: Sequelize.ENUM('text', 'color'),
          allowNull: false,
          defaultValue: 'text'
        },
        values: {
          type: Sequelize.STRING,
          allowNull: false
        }
      });
    }

    // Tabela de relacionamento entre produtos e categorias
    if (!existe('product_categories')) {
      await queryInterface.createTable('product_categories', {
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        product_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        category_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'categories',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      });
    }

    console.log('Migration inicial verificada/aplicada.');
  },

  async down() {
    // Preserva as tabelas e os dados existentes.
    console.log('Rollback não executado para preservar os dados existentes.');
  }
};

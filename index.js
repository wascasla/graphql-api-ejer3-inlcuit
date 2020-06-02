const express = require('express')
const app = express()
const expressGraphQL = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLList
} = require('graphql');

const courses = require('./courses.json')
const students = require('./students.json')
const grades = require('./grades.json')

//defino los tipos para graphql
const CourseType = new GraphQLObjectType({
    name: 'Course',
    description: 'Represent courses',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt) },
        name: {type: GraphQLNonNull(GraphQLString) },
        description: {type: GraphQLNonNull(GraphQLString) },
    })
})

const StudentType = new GraphQLObjectType({
    name: 'Student',
    description: 'Represent students',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        lastname: {type: GraphQLNonNull(GraphQLString)},
        courseId: {type: GraphQLNonNull(GraphQLInt)},
        course: {
            type: CourseType,
            resolve: (student) => {
                return courses.find(course => course.id === student.courseId)
            }
        }
    })
})

const GradeType = new GraphQLObjectType({
    name: 'Grade',
    description: 'Represent grades',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        courseId: {type: GraphQLNonNull(GraphQLInt)},
        studentId: {type: GraphQLNonNull(GraphQLInt)},
        grade: {type: GraphQLNonNull(GraphQLInt)},
    })
})

//defino las mutaciones
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addCourse: {
            type: CourseType,
            description: 'Add a course',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
                description: { type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const course = {
                    id: courses.length + 1,
                    name: args.name,
                    description: args.description
                }
                courses.push(course)
                return course
            }
        },
    })
})


//defino las query para consultas
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        courses: {
            type: new GraphQLList(CourseType),
            description: 'List of All Courses',
            resolve: () => courses
        },
        students: {
            type: new GraphQLList(StudentType),
        description: 'List of All Students',
        resolve: () => students
        },
        grades: {
            type: new GraphQLList(GradeType),
        description: 'List of All Grades',
        resolve: () => grades
        },
        course: {
            type: CourseType,
            description: 'Particular Course',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => courses.find(course => course.id === args.id)
        },
        student: {
            type: StudentType,
            description: 'Particular Student',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => students.find(student => student.id === args.id)
        },
        grade: {
            type: GradeType,
            description: 'Particular Grade',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => grades.find(grade => grade.id === args.id)
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(3000, () => {
    console.log('Server running');
    
})